import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageType,
  sanitizeFilename,
} from "@/lib/utils";

const BUCKET = "product-images";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const productId = String(formData.get("product_id") ?? "").trim();
  const file = formData.get("file");

  if (!productId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing product or file" }, { status: 400 });
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: `Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = sanitizeFilename(file.name);
  const storagePath = `${productId}/${Date.now()}-${safeName || `image.${ext}`}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createServiceClient();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const imageCount = await prisma.productImage.count({ where: { product_id: productId } });

  const image = await prisma.productImage.create({
    data: {
      product_id: productId,
      storage_path: storagePath,
      sort_order: imageCount,
      alt_text: safeName,
    },
  });

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({
    id: image.id,
    storage_path: storagePath,
    public_url: publicUrl.publicUrl,
  });
}
