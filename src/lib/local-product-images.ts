import { mkdir, writeFile, access } from "fs/promises";
import path from "path";
import { constants as fsConstants } from "fs";

const BUCKET_FOLDER = "product-images";

/** Absolute path under public/uploads/product-images/... */
export function localUploadAbsolutePath(storageKey: string): string {
  const parts = storageKey.split("/").filter(Boolean);
  return path.join(process.cwd(), "public", "uploads", BUCKET_FOLDER, ...parts);
}

/** Browser URL for a local cached upload (same-origin static file). */
export function localUploadPublicUrl(storageKey: string): string {
  const encoded = storageKey
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/uploads/${BUCKET_FOLDER}/${encoded}`;
}

export async function localUploadExists(storageKey: string): Promise<boolean> {
  try {
    await access(localUploadAbsolutePath(storageKey), fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function writeLocalProductImage(
  storageKey: string,
  data: Buffer | Uint8Array,
): Promise<string> {
  const abs = localUploadAbsolutePath(storageKey);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, data);
  return localUploadPublicUrl(storageKey);
}

export function isImageContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return base.startsWith("image/");
}
