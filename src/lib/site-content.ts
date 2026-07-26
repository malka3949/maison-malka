import type { Locale as AppLocale, Messages } from "@/lib/i18n";

/** Allowlisted text CMS keys (per locale he|en). */
export const SITE_TEXT_KEYS = [
  "announcement",
  "hero.eyebrow",
  "hero.title",
  "hero.subtitle",
  "hero.cta_primary",
  "hero.cta_secondary",
  "ticker",
  "promo.catalog.label",
  "promo.catalog.title",
  "promo.catalog.body",
  "promo.catalog.cta",
  "promo.gift.label",
  "promo.gift.title",
  "promo.gift.body",
  "promo.gift.cta",
  "trust.delivery",
  "trust.delivery_sub",
  "trust.pickup",
  "trust.pickup_sub",
  "trust.handmade",
  "trust.handmade_sub",
  "trust.approval",
  "trust.approval_sub",
  "final_cta.title",
  "final_cta.body",
  "final_cta.button",
  "footer.tagline",
  "footer.hours_note",
] as const;

export type SiteTextKey = (typeof SITE_TEXT_KEYS)[number];

/** Image slots — stored as SiteContentBlock with shared locale `he`; value = SiteMedia.id */
export const SITE_IMAGE_SLOT_KEYS = [
  "hero.image",
  "promo.catalog.image",
  "promo.gift.image",
] as const;

export type SiteImageSlotKey = (typeof SITE_IMAGE_SLOT_KEYS)[number];

export const SITE_SETTINGS_KEYS = [
  "pickup_address",
  "phone",
  "contact_email",
  "business_hours",
  "lead_time_note",
  "bank_transfer_details",
] as const;

export type SiteSettingsKey = (typeof SITE_SETTINGS_KEYS)[number];

const TEXT_KEY_SET = new Set<string>(SITE_TEXT_KEYS);
const IMAGE_KEY_SET = new Set<string>(SITE_IMAGE_SLOT_KEYS);
const SETTINGS_KEY_SET = new Set<string>(SITE_SETTINGS_KEYS);

export function isSiteTextKey(key: string): key is SiteTextKey {
  return TEXT_KEY_SET.has(key);
}

export function isSiteImageSlotKey(key: string): key is SiteImageSlotKey {
  return IMAGE_KEY_SET.has(key);
}

export function isSiteSettingsKey(key: string): key is SiteSettingsKey {
  return SETTINGS_KEY_SET.has(key);
}

export function assertAllowedTextKey(key: string): SiteTextKey {
  if (!isSiteTextKey(key)) {
    throw new Error(`Unknown site text key: ${key}`);
  }
  return key;
}

export function assertAllowedImageSlotKey(key: string): SiteImageSlotKey {
  if (!isSiteImageSlotKey(key)) {
    throw new Error(`Unknown site image slot key: ${key}`);
  }
  return key;
}

export function assertAllowedSettingsKey(key: string): SiteSettingsKey {
  if (!isSiteSettingsKey(key)) {
    throw new Error(`Unknown site settings key: ${key}`);
  }
  return key;
}

/** Ticker: newline-separated plain text ↔ string[] */
export function joinTickerItems(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join("\n");
}

export function splitTickerItems(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** CMS text key → Messages field (except ticker). */
export const TEXT_KEY_TO_MESSAGE: Record<
  Exclude<SiteTextKey, "ticker">,
  keyof Messages
> = {
  announcement: "announcement",
  "hero.eyebrow": "heroEyebrow",
  "hero.title": "heroTitle",
  "hero.subtitle": "heroSubtitle",
  "hero.cta_primary": "heroCta",
  "hero.cta_secondary": "heroSecondaryCta",
  "promo.catalog.label": "promoCatalogLabel",
  "promo.catalog.title": "promoCatalogTitle",
  "promo.catalog.body": "promoCatalogBody",
  "promo.catalog.cta": "promoCatalogCta",
  "promo.gift.label": "promoGiftLabel",
  "promo.gift.title": "promoGiftTitle",
  "promo.gift.body": "promoGiftBody",
  "promo.gift.cta": "promoGiftCta",
  "trust.delivery": "trustDelivery",
  "trust.delivery_sub": "trustDeliverySub",
  "trust.pickup": "trustPickup",
  "trust.pickup_sub": "trustPickupSub",
  "trust.handmade": "trustHandmade",
  "trust.handmade_sub": "trustHandmadeSub",
  "trust.approval": "trustApproval",
  "trust.approval_sub": "trustApprovalSub",
  "final_cta.title": "ctaFinalTitle",
  "final_cta.body": "ctaFinalBody",
  "final_cta.button": "ctaFinalButton",
  "footer.tagline": "footerNote",
  "footer.hours_note": "hoursLabel",
};

/**
 * Merge CMS text blocks onto message defaults.
 * Missing/blank values keep the messages fallback.
 */
export function mergeMessagesWithCms(
  messages: Messages,
  blocksByKey: Record<string, string | null | undefined>,
): Messages {
  const next: Messages = {
    ...messages,
    tickerItems: [...messages.tickerItems],
  };

  for (const key of SITE_TEXT_KEYS) {
    const raw = blocksByKey[key];
    if (raw == null) continue;
    const trimmed = String(raw).trim();
    if (!trimmed) continue;

    if (key === "ticker") {
      next.tickerItems = splitTickerItems(trimmed);
      continue;
    }

    const field = TEXT_KEY_TO_MESSAGE[key];
    (next as Record<string, unknown>)[field] = trimmed;
  }

  return next;
}

export type HomeMediaSlots = {
  hero: string;
  promoCatalog: string;
  promoGift: string;
};

/**
 * Resolve home image URLs: CMS public URL when set, else HOME_MEDIA fallbacks.
 */
export function resolveHomeMediaSlots(
  fallbacks: HomeMediaSlots,
  slotUrls: Partial<Record<SiteImageSlotKey, string | null | undefined>>,
): HomeMediaSlots {
  return {
    hero: slotUrls["hero.image"]?.trim() || fallbacks.hero,
    promoCatalog:
      slotUrls["promo.catalog.image"]?.trim() || fallbacks.promoCatalog,
    promoGift: slotUrls["promo.gift.image"]?.trim() || fallbacks.promoGift,
  };
}

export type SiteSettingsMap = Partial<Record<SiteSettingsKey, string>>;

export function mergeSettings(
  rows: { key: string; value: string }[],
): SiteSettingsMap {
  const out: SiteSettingsMap = {};
  for (const row of rows) {
    if (!isSiteSettingsKey(row.key)) continue;
    const v = row.value.trim();
    if (v) out[row.key] = v;
  }
  return out;
}

export type BusinessContact = {
  phone: string;
  email: string;
  address: string;
  hours: string;
};

/**
 * Always-visible contact: CMS settings when set, else message fallbacks.
 */
export function resolveBusinessContact(
  settings: SiteSettingsMap,
  messages: Pick<
    Messages,
    | "fallbackPhone"
    | "fallbackContactEmail"
    | "fallbackPickupAddress"
    | "fallbackBusinessHours"
  >,
): BusinessContact {
  return {
    phone: settings.phone?.trim() || messages.fallbackPhone,
    email: settings.contact_email?.trim() || messages.fallbackContactEmail,
    address: settings.pickup_address?.trim() || messages.fallbackPickupAddress,
    hours:
      settings.business_hours?.trim() || messages.fallbackBusinessHours,
  };
}

export type CmsLocale = AppLocale;
