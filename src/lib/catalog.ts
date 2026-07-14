import { Locale as PrismaLocale } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n";

function toPrismaLocale(locale: Locale): PrismaLocale {
  return locale === "en" ? PrismaLocale.en : PrismaLocale.he;
}

export async function getActiveCategories(locale: Locale) {
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
    include: { translations: true },
  });
  const loc = toPrismaLocale(locale);
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name:
      c.translations.find((t) => t.locale === loc)?.name ??
      c.translations[0]?.name ??
      c.slug,
  }));
}

export async function getAvailableProducts(locale: Locale, categorySlug?: string) {
  const loc = toPrismaLocale(locale);
  const products = await prisma.product.findMany({
    where: {
      is_available: true,
      category: {
        is_active: true,
        ...(categorySlug ? { slug: categorySlug } : {}),
      },
    },
    orderBy: { sort_order: "asc" },
    include: {
      translations: true,
      images: { orderBy: { sort_order: "asc" }, take: 1 },
      category: { include: { translations: true } },
    },
  });

  return products.map((p) => {
    const tr =
      p.translations.find((t) => t.locale === loc) ?? p.translations[0];
    return {
      id: p.id,
      basePrice: Number(p.base_price),
      productType: p.product_type,
      name: tr?.name ?? p.id,
      description: tr?.description ?? "",
      imagePath: p.images[0]?.storage_path ?? null,
      categorySlug: p.category.slug,
      categoryName:
        p.category.translations.find((t) => t.locale === loc)?.name ??
        p.category.slug,
    };
  });
}

export async function getProductDetail(productId: string, locale: Locale) {
  const loc = toPrismaLocale(locale);
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      is_available: true,
      category: { is_active: true },
    },
    include: {
      translations: true,
      images: { orderBy: { sort_order: "asc" } },
      options: {
        orderBy: { sort_order: "asc" },
        include: { values: true },
      },
      bundle_items: {
        include: {
          item_product: {
            include: { translations: true },
          },
        },
      },
      category: { include: { translations: true } },
    },
  });

  if (!product) {
    return null;
  }

  const tr =
    product.translations.find((t) => t.locale === loc) ?? product.translations[0];

  return {
    id: product.id,
    basePrice: Number(product.base_price),
    productType: product.product_type,
    name: tr?.name ?? product.id,
    description: tr?.description ?? "",
    images: product.images.map((img) => ({
      path: img.storage_path,
      alt: img.alt_text,
    })),
    options: product.options.map((opt) => ({
      id: opt.id,
      nameKey: opt.name_key,
      isRequired: opt.is_required,
      values: opt.values.map((v) => ({
        id: v.id,
        labelKey: v.label_key,
        priceDelta: Number(v.price_delta),
        isDefault: v.is_default,
      })),
    })),
    bundleItems: product.bundle_items.map((bi) => {
      const itemTr =
        bi.item_product.translations.find((t) => t.locale === loc) ??
        bi.item_product.translations[0];
      return {
        quantity: bi.quantity,
        name: itemTr?.name ?? bi.item_product_id,
      };
    }),
    categorySlug: product.category.slug,
  };
}
