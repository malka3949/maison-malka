"use server";

import { Locale } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/admin";
import { deleteLocalSiteMedia } from "@/lib/local-site-media";
import {
  assertAllowedImageSlotKey,
  assertAllowedSettingsKey,
  assertAllowedTextKey,
  SITE_IMAGE_SLOT_KEYS,
  SITE_SETTINGS_KEYS,
  SITE_TEXT_KEYS,
} from "@/lib/site-content";

export type SiteFormState = {
  error?: string;
  success?: boolean;
};

function revalidateStorefront() {
  revalidatePath("/he");
  revalidatePath("/en");
  revalidatePath("/he", "layout");
  revalidatePath("/en", "layout");
}

export async function upsertSiteTextBlocksAction(
  _prev: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "אין הרשאה" };

  const localeRaw = String(formData.get("locale") ?? "he").trim();
  const locale = localeRaw === "en" ? Locale.en : Locale.he;

  try {
    for (const key of SITE_TEXT_KEYS) {
      if (!formData.has(key)) continue;
      assertAllowedTextKey(key);
      const value = String(formData.get(key) ?? "");
      await prisma.siteContentBlock.upsert({
        where: { key_locale: { key, locale } },
        create: { key, locale, value },
        update: { value },
      });
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בשמירה",
    };
  }

  revalidatePath("/admin/site");
  revalidateStorefront();
  return { success: true };
}

export async function upsertImageSlotsAction(
  _prev: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "אין הרשאה" };

  try {
    for (const key of SITE_IMAGE_SLOT_KEYS) {
      assertAllowedImageSlotKey(key);
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        const media = await prisma.siteMedia.findUnique({ where: { id: value } });
        if (!media) {
          return { error: `מדיה לא נמצאה עבור ${key}` };
        }
      }
      await prisma.siteContentBlock.upsert({
        where: { key_locale: { key, locale: Locale.he } },
        create: { key, locale: Locale.he, value },
        update: { value },
      });
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בשמירה",
    };
  }

  revalidatePath("/admin/site");
  revalidateStorefront();
  return { success: true };
}

export async function upsertSiteSettingsAction(
  _prev: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "אין הרשאה" };

  try {
    for (const key of SITE_SETTINGS_KEYS) {
      assertAllowedSettingsKey(key);
      const value = String(formData.get(key) ?? "");
      await prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "שגיאה בשמירה",
    };
  }

  revalidatePath("/admin/settings");
  revalidateStorefront();
  return { success: true };
}

export async function updateSiteMediaAltsAction(
  _prev: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "אין הרשאה" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "חסר מזהה" };

  const alt_he = String(formData.get("alt_he") ?? "");
  const alt_en = String(formData.get("alt_en") ?? "");

  await prisma.siteMedia.update({
    where: { id },
    data: { alt_he, alt_en },
  });

  revalidatePath("/admin/media");
  revalidateStorefront();
  return { success: true };
}

export async function deleteSiteMediaAction(
  _prev: SiteFormState,
  formData: FormData,
): Promise<SiteFormState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "אין הרשאה" };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "חסר מזהה" };

  const media = await prisma.siteMedia.findUnique({ where: { id } });
  if (!media) return { error: "לא נמצא" };

  // Clear image slot refs pointing at this media
  await prisma.siteContentBlock.updateMany({
    where: {
      key: { in: [...SITE_IMAGE_SLOT_KEYS] },
      value: id,
    },
    data: { value: "" },
  });

  const supabase = createServiceClient();
  await supabase.storage.from("site-media").remove([media.storage_path]);
  await deleteLocalSiteMedia(media.storage_path);
  await prisma.siteMedia.delete({ where: { id } });

  revalidatePath("/admin/media");
  revalidatePath("/admin/site");
  revalidateStorefront();
  return { success: true };
}
