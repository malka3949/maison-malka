import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/admin";
import { writeLocalSiteMedia } from "@/lib/local-site-media";
import { getSiteMediaPublicUrl } from "@/lib/site-media-url";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  isAllowedImageType,
  sanitizeFilename,
} from "@/lib/utils";

export const runtime = "nodejs";

const BUCKET = "site-media";

function mimeFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return null;
}

async function ensureSiteMediaBucket(
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

  const { error: updateError } = await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
  });
  if (updateError) {
    console.warn("[site-upload] updateBucket:", updateError.message);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 401 });
    }

    const formData = await request.formData();
    const raw = formData.get("file");
    const altHe = String(formData.get("alt_he") ?? "").trim();
    const altEn = String(formData.get("alt_en") ?? "").trim();

    if (!(raw instanceof Blob)) {
      return NextResponse.json({ error: "חסר קובץ" }, { status: 400 });
    }

    const fileName =
      raw instanceof File && raw.name ? raw.name : "site-image.png";
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
          error: `הקובץ גדול מ-${MAX_IMAGE_SIZE_MB}MB.`,
        },
        { status: 400 },
      );
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "png";
    const safeName = sanitizeFilename(fileName);
    const storagePath = `${Date.now()}-${safeName || `image.${ext}`}`;

    const buffer = Buffer.from(await raw.arrayBuffer());
    const supabase = createServiceClient();
    await ensureSiteMediaBucket(supabase);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `העלאה ל-Storage נכשלה: ${uploadError.message}` },
        { status: 500 },
      );
    }

    try {
      await writeLocalSiteMedia(storagePath, buffer);
    } catch (err) {
      console.warn("[site-upload] local cache write failed:", err);
    }

    const media = await prisma.siteMedia.create({
      data: {
        storage_path: storagePath,
        alt_he: altHe,
        alt_en: altEn,
      },
    });

    return NextResponse.json({
      id: media.id,
      storage_path: storagePath,
      public_url: getSiteMediaPublicUrl(storagePath),
    });
  } catch (err) {
    console.error("[site-upload] fatal:", err);
    const message = err instanceof Error ? err.message : "שגיאה בהעלאה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
