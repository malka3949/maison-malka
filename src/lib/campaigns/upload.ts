import { createServiceClient } from "@/lib/supabase/admin";
import { writeLocalSiteMedia } from "@/lib/local-site-media";
import { sniffImageMime } from "@/lib/image-magic";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  sanitizeFilename,
} from "@/lib/utils";

const BUCKET = "site-media";
export const MAX_CAMPAIGN_PDF_BYTES = 5 * 1024 * 1024;

export type CampaignUploadResult =
  | { ok: true; storagePath: string; filename: string; contentType: string; buffer: Buffer }
  | { ok: false; error: string };

function isPdfBuffer(buf: Buffer): boolean {
  return buf.length >= 4 && buf.subarray(0, 4).toString("utf8") === "%PDF";
}

async function ensureCampaignBucket(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const existing = (buckets ?? []).find((b) => b.name === BUCKET);
  const allowed = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
  if (!existing) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
      allowedMimeTypes: allowed,
    });
    return;
  }
  await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    allowedMimeTypes: allowed,
  });
}

export async function uploadCampaignImage(
  file: Blob,
  campaignKey: string,
): Promise<CampaignUploadResult> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, error: "image_too_large" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageMime(buffer);
  if (!contentType) {
    return { ok: false, error: "image_type" };
  }
  const ext =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/png"
        ? "png"
        : "webp";
  const name =
    file instanceof File && file.name
      ? sanitizeFilename(file.name)
      : `image.${ext}`;
  const storagePath = `campaigns/${campaignKey}/${Date.now()}-${name || `image.${ext}`}`;

  const supabase = createServiceClient();
  await ensureCampaignBucket(supabase);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });
  if (error) {
    console.error("[campaign-upload] image", error.message);
    return { ok: false, error: "upload_failed" };
  }
  try {
    await writeLocalSiteMedia(storagePath, buffer);
  } catch (err) {
    console.warn("[campaign-upload] local cache", err);
  }
  return { ok: true, storagePath, filename: name || `image.${ext}`, contentType, buffer };
}

export async function uploadCampaignPdf(
  file: Blob,
  campaignKey: string,
): Promise<CampaignUploadResult> {
  if (file.size > MAX_CAMPAIGN_PDF_BYTES) {
    return { ok: false, error: "pdf_too_large" };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isPdfBuffer(buffer)) {
    return { ok: false, error: "pdf_type" };
  }
  const name =
    file instanceof File && file.name
      ? sanitizeFilename(file.name)
      : "promo.pdf";
  const filename = name.toLowerCase().endsWith(".pdf")
    ? name
    : `${name || "promo"}.pdf`;
  const storagePath = `campaigns/${campaignKey}/${Date.now()}-${filename}`;

  const supabase = createServiceClient();
  await ensureCampaignBucket(supabase);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (error) {
    console.error("[campaign-upload] pdf", error.message);
    return { ok: false, error: "upload_failed" };
  }
  try {
    await writeLocalSiteMedia(storagePath, buffer);
  } catch (err) {
    console.warn("[campaign-upload] local cache", err);
  }
  return {
    ok: true,
    storagePath,
    filename,
    contentType: "application/pdf",
    buffer,
  };
}

export function isPdfMagicForTest(buf: Buffer): boolean {
  return isPdfBuffer(buf);
}
