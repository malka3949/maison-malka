/**
 * Browser-safe storefront helpers (no Node `fs` — used by client components too).
 */

export function formatIls(amount: number, currencySymbol = "₪"): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

const PRODUCT_IMAGES_MARKER = "/storage/v1/object/public/product-images/";

function extractStorageKey(storagePath: string): string | null {
  if (!storagePath) return null;

  const markerIdx = storagePath.indexOf(PRODUCT_IMAGES_MARKER);
  if (markerIdx !== -1) {
    return storagePath.slice(markerIdx + PRODUCT_IMAGES_MARKER.length) || null;
  }

  if (storagePath.startsWith("/api/media/product-images/")) {
    return decodeURIComponent(
      storagePath.slice("/api/media/product-images/".length),
    );
  }

  if (storagePath.startsWith("/uploads/product-images/")) {
    return decodeURIComponent(
      storagePath.slice("/uploads/product-images/".length),
    );
  }

  if (storagePath.startsWith("/")) {
    return null;
  }

  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return null;
  }

  return storagePath;
}

/** Same-origin URL so the browser never hits supabase.co (NetFree often blocks it). */
export function getProductImageProxyUrl(storageKey: string): string {
  const encoded = storageKey
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/");
  return `/api/media/product-images/${encoded}`;
}

/**
 * Resolves a product image path to a browser URL.
 * Storage keys → `/api/media/...` (server may serve local disk cache under the hood).
 * Site-root paths (e.g. /placeholders/...) left as-is.
 */
export function getProductImagePublicUrl(storagePath: string): string | null {
  if (!storagePath) {
    return null;
  }

  const key = extractStorageKey(storagePath);
  if (key) {
    return getProductImageProxyUrl(key);
  }

  if (storagePath.startsWith("/")) {
    return storagePath;
  }

  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  return getProductImageProxyUrl(storagePath);
}

export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return translations.find((t) => t.locale === locale) ?? translations[0];
}
