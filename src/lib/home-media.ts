/**
 * Fixed homepage marketing images (site-local).
 * Intentionally NOT derived from the live product catalog —
 * adding/editing products must not swap these frames.
 *
 * Replace files under /public/placeholders or change paths here when
 * the business supplies final brand photography.
 */
export const HOME_MEDIA = {
  hero: "/placeholders/cake.jpg",
  promoCatalog: "/placeholders/pastry.jpg",
  promoGift: "/placeholders/giftbox.jpg",
} as const;
