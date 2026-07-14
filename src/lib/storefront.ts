export function formatIls(amount: number, currencySymbol = "₪"): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

export function getProductImagePublicUrl(storagePath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !storagePath) {
    return null;
  }
  return `${base}/storage/v1/object/public/product-images/${storagePath}`;
}

export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return translations.find((t) => t.locale === locale) ?? translations[0];
}
