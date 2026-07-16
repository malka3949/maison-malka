/**
 * Public URL helpers for site-media (NetFree-friendly same-origin preferred).
 */
export function getSiteMediaPublicUrl(storagePath: string): string | null {
  if (!storagePath) return null;
  const key = storagePath.replace(/^site-media\//, "").replace(/^\//, "");
  if (!key) return null;
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/uploads/site-media/${encoded}`;
}

export function getSiteMediaProxyUrl(storageKey: string): string {
  const encoded = storageKey
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/media/site-media/${encoded}`;
}
