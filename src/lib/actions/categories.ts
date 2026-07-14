"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Locale } from "@prisma/client";

export type CategoryFormState = {
  error?: string;
  success?: boolean;
};

export async function upsertCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "אין הרשאה" };
  }

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const slugInput = String(formData.get("slug") ?? "").trim();
  const nameHe = String(formData.get("name_he") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;
  const isActive = formData.get("is_active") === "on";

  if (!nameHe || !nameEn) {
    return { error: "שם בעברית ובאנגלית נדרשים" };
  }

  const slug = slugInput || slugify(nameEn);
  if (!slug) {
    return { error: "נדרש slug תקין" };
  }

  const existingSlug = await prisma.category.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
  });
  if (existingSlug) {
    return { error: "slug כבר קיים" };
  }

  if (id) {
    await prisma.category.update({
      where: { id },
      data: {
        slug,
        sort_order: sortOrder,
        is_active: isActive,
        translations: {
          upsert: [
            {
              where: { category_id_locale: { category_id: id, locale: Locale.he } },
              create: { locale: Locale.he, name: nameHe },
              update: { name: nameHe },
            },
            {
              where: { category_id_locale: { category_id: id, locale: Locale.en } },
              create: { locale: Locale.en, name: nameEn },
              update: { name: nameEn },
            },
          ],
        },
      },
    });
  } else {
    await prisma.category.create({
      data: {
        slug,
        sort_order: sortOrder,
        is_active: isActive,
        translations: {
          create: [
            { locale: Locale.he, name: nameHe },
            { locale: Locale.en, name: nameEn },
          ],
        },
      },
    });
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  await prisma.category.update({
    where: { id },
    data: { is_active: isActive },
  });

  revalidatePath("/admin/categories");
}

export async function toggleCategoryActiveFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";
  await toggleCategoryActiveAction(id, !isActive);
}
