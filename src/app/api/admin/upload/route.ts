import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/admin";
import { getProductImagePublicUrl } from "@/lib/storefront";
import { writeLocalProductImage } from "@/lib/local-product-images";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  isAllowedImageType,
  sanitizeFilename,
} from "@/lib/utils";

export const runtime = "nodejs";

const BUCKET = "product-images";

function mimeFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

async function ensureProductImagesBucket(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Cannot list storage buckets: ${listError.message}`);
  }

  const existing = (buckets ?? []).find((b) => b.name === BUCKET);
  if (!existing) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
      allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Cannot create storage bucket: ${createError.message}`);
    }
    return;
  }

  // Keep limits in sync when the bucket already exists (old 5MB buckets etc.)
  const { error: updateError } = await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
  });
  if (updateError) {
    // Non-fatal — upload may still work with existing policy
    console.warn("[upload] updateBucket:", updateError.message);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
    }

    const formData = await request.formData();
    const productId = String(formData.get("product_id") ?? "").trim();
    const raw = formData.get("file");

    // Next/undici may hand a Blob that is also a File — accept both
    if (!productId || !(raw instanceof Blob)) {
      return NextResponse.json({ error: "חסרים מוצר או קובץ" }, { status: 400 });
    }

    const fileName =
      raw instanceof File && raw.name
        ? raw.name
        : "product-edited.png";
    const contentType =
      (raw.type && raw.type !== "application/octet-stream"
        ? raw.type
        : null) ??
      mimeFromName(fileName) ??
      "";

    if (!isAllowedImageType(contentType)) {
      return NextResponse.json(
        {
          error: `סוג קובץ לא נתמך (${contentType || "ריק"}). מותר: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (raw.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `הקובץ גדול מ-${MAX_IMAGE_SIZE_MB}MB (${(raw.size / (1024 * 1024)).toFixed(1)}MB אחרי עיבוד). נסו תמונה קטנה יותר.`,
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "המוצר לא נמצא" }, { status: 404 });
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "png";
    const safeName = sanitizeFilename(fileName);
    const storagePath = `${productId}/${Date.now()}-${safeName || `image.${ext}`}`;

    const buffer = Buffer.from(await raw.arrayBuffer());
    const supabase = createServiceClient();

    await ensureProductImagesBucket(supabase);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload] storage:", uploadError.message);
      return NextResponse.json(
        { error: `העלאה ל-Storage נכשלה: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Local copy for NetFree-friendly same-origin static serving
    try {
      await writeLocalProductImage(storagePath, buffer);
    } catch (err) {
      console.warn("[upload] local cache write failed:", err);
    }

    const imageCount = await prisma.productImage.count({
      where: { product_id: productId },
    });

    const image = await prisma.productImage.create({
      data: {
        product_id: productId,
        storage_path: storagePath,
        sort_order: imageCount,
        alt_text: safeName,
      },
    });

    return NextResponse.json({
      id: image.id,
      storage_path: storagePath,
      public_url:
        getProductImagePublicUrl(storagePath) ??
        `/api/media/product-images/${storagePath}`,
    });
  } catch (err) {
    console.error("[upload] fatal:", err);
    const message = err instanceof Error ? err.message : "שגיאה בהעלאה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
