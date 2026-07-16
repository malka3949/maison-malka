import { mkdir, writeFile, access, unlink } from "fs/promises";
import path from "path";
import { constants as fsConstants } from "fs";

const BUCKET_FOLDER = "site-media";

export function localSiteMediaAbsolutePath(storageKey: string): string {
  const parts = storageKey.split("/").filter(Boolean);
  return path.join(process.cwd(), "public", "uploads", BUCKET_FOLDER, ...parts);
}

export function localSiteMediaPublicUrl(storageKey: string): string {
  const encoded = storageKey
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/uploads/${BUCKET_FOLDER}/${encoded}`;
}

export async function localSiteMediaExists(storageKey: string): Promise<boolean> {
  try {
    await access(localSiteMediaAbsolutePath(storageKey), fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function writeLocalSiteMedia(
  storageKey: string,
  data: Buffer | Uint8Array,
): Promise<string> {
  const abs = localSiteMediaAbsolutePath(storageKey);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, data);
  return localSiteMediaPublicUrl(storageKey);
}

export async function deleteLocalSiteMedia(storageKey: string): Promise<void> {
  try {
    await unlink(localSiteMediaAbsolutePath(storageKey));
  } catch {
    // ignore missing
  }
}
