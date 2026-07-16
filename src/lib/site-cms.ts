import { Locale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HOME_MEDIA } from "@/lib/home-media";
import type { Locale as AppLocale, Messages } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";
import {
  mergeMessagesWithCms,
  mergeSettings,
  resolveHomeMediaSlots,
  SITE_IMAGE_SLOT_KEYS,
  type SiteImageSlotKey,
  type SiteSettingsMap,
} from "@/lib/site-content";
import { getSiteMediaPublicUrl } from "@/lib/site-media-url";

function toPrismaLocale(locale: AppLocale): Locale {
  return locale === "en" ? Locale.en : Locale.he;
}

export async function loadMergedStorefrontMessages(
  locale: AppLocale,
): Promise<Messages> {
  const base = getMessages(locale);
  const blocks = await prisma.siteContentBlock.findMany({
    where: { locale: toPrismaLocale(locale) },
  });
  const byKey: Record<string, string> = {};
  for (const b of blocks) {
    byKey[b.key] = b.value;
  }
  return mergeMessagesWithCms(base, byKey);
}

export async function loadHomeMediaFromCms(): Promise<{
  hero: string;
  promoCatalog: string;
  promoGift: string;
}> {
  const slots = await prisma.siteContentBlock.findMany({
    where: {
      locale: Locale.he,
      key: { in: [...SITE_IMAGE_SLOT_KEYS] },
    },
  });

  const mediaIds = slots
    .map((s) => s.value.trim())
    .filter(Boolean);

  const mediaRows =
    mediaIds.length > 0
      ? await prisma.siteMedia.findMany({ where: { id: { in: mediaIds } } })
      : [];
  const mediaById = new Map(mediaRows.map((m) => [m.id, m]));

  const slotUrls: Partial<Record<SiteImageSlotKey, string | null>> = {};
  for (const slot of slots) {
    const key = slot.key as SiteImageSlotKey;
    const id = slot.value.trim();
    if (!id) continue;
    const media = mediaById.get(id);
    if (!media) continue;
    slotUrls[key] = getSiteMediaPublicUrl(media.storage_path);
  }

  return resolveHomeMediaSlots(
    {
      hero: HOME_MEDIA.hero,
      promoCatalog: HOME_MEDIA.promoCatalog,
      promoGift: HOME_MEDIA.promoGift,
    },
    slotUrls,
  );
}

export async function loadSiteSettingsMap(): Promise<SiteSettingsMap> {
  const rows = await prisma.siteSettings.findMany();
  return mergeSettings(rows);
}

/** Image slot assignments: key → SiteMedia.id (or ""). */
export async function loadImageSlotAssignments(): Promise<
  Record<SiteImageSlotKey, string>
> {
  const slots = await prisma.siteContentBlock.findMany({
    where: {
      locale: Locale.he,
      key: { in: [...SITE_IMAGE_SLOT_KEYS] },
    },
  });
  const out = {
    "hero.image": "",
    "promo.catalog.image": "",
    "promo.gift.image": "",
  } as Record<SiteImageSlotKey, string>;
  for (const s of slots) {
    if (s.key in out) {
      out[s.key as SiteImageSlotKey] = s.value.trim();
    }
  }
  return out;
}
