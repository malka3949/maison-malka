"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parsePrice } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Locale, ProductType } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type ProductFormState = {
  error?: string;
  success?: boolean;
  productId?: string;
};

export async function upsertProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "אין הרשאה" };
  }

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const productType = String(formData.get("product_type") ?? "standard") as ProductType;
  const basePrice = parsePrice(String(formData.get("base_price") ?? ""));
  const sortOrder = Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;
  const isAvailable = formData.get("is_available") === "on";
  const nameHe = String(formData.get("name_he") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const descriptionHe = String(formData.get("description_he") ?? "").trim();
  const descriptionEn = String(formData.get("description_en") ?? "").trim();

  if (!categoryId || basePrice === null || !nameHe || !nameEn) {
    return { error: "נא למלא את כל השדות הנדרשים" };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { error: "קטגוריה לא נמצאה" };
  }

  const translationData = {
    upsert: [
      {
        where: { product_id_locale: { product_id: id ?? "", locale: Locale.he } },
        create: { locale: Locale.he, name: nameHe, description: descriptionHe },
        update: { name: nameHe, description: descriptionHe },
      },
      {
        where: { product_id_locale: { product_id: id ?? "", locale: Locale.en } },
        create: { locale: Locale.en, name: nameEn, description: descriptionEn },
        update: { name: nameEn, description: descriptionEn },
      },
    ],
  };

  let productId = id;

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        category_id: categoryId,
        product_type: productType,
        base_price: new Prisma.Decimal(basePrice),
        sort_order: sortOrder,
        is_available: isAvailable,
        translations: translationData,
      },
    });
  } else {
    const created = await prisma.product.create({
      data: {
        category_id: categoryId,
        product_type: productType,
        base_price: new Prisma.Decimal(basePrice),
        sort_order: sortOrder,
        is_available: isAvailable,
        translations: {
          create: [
            { locale: Locale.he, name: nameHe, description: descriptionHe },
            { locale: Locale.en, name: nameEn, description: descriptionEn },
          ],
        },
      },
    });
    productId = created.id;
  }

  revalidatePath("/admin/products");
  if (productId) {
    revalidatePath(`/admin/products/${productId}`);
  }

  // New products must land on the edit page where image upload lives.
  if (!id && productId) {
    redirect(`/admin/products/${productId}?created=1`);
  }

  return { success: true, productId };
}

export async function toggleProductAvailabilityAction(id: string, isAvailable: boolean) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  await prisma.product.update({
    where: { id },
    data: { is_available: isAvailable },
  });

  revalidatePath("/admin/products");
}

export async function toggleProductAvailabilityFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isAvailable = formData.get("is_available") === "true";
  await toggleProductAvailabilityAction(id, !isAvailable);
}

export async function addProductOptionAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "אין הרשאה" };
  }

  const productId = String(formData.get("product_id") ?? "").trim();
  const nameKey = String(formData.get("name_key") ?? "").trim();
  const isRequired = formData.get("is_required") === "on";
  const sortOrder = Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;

  if (!productId || !nameKey) {
    return { error: "שדות חסרים" };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.product_type !== ProductType.standard) {
    return { error: "אפשרויות רק למוצר רגיל" };
  }

  await prisma.productOption.create({
    data: { product_id: productId, name_key: nameKey, is_required: isRequired, sort_order: sortOrder },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function addOptionValueAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "אין הרשאה" };
  }

  const productId = String(formData.get("product_id") ?? "").trim();
  const optionId = String(formData.get("option_id") ?? "").trim();
  const labelKey = String(formData.get("label_key") ?? "").trim();
  const priceDelta = parsePrice(String(formData.get("price_delta") ?? "0")) ?? 0;
  const isDefault = formData.get("is_default") === "on";

  if (!optionId || !labelKey) {
    return { error: "שדות חסרים" };
  }

  await prisma.productOptionValue.create({
    data: {
      product_option_id: optionId,
      label_key: labelKey,
      price_delta: new Prisma.Decimal(priceDelta),
      is_default: isDefault,
    },
  });

  if (productId) {
    revalidatePath(`/admin/products/${productId}`);
  }
  return { success: true };
}

export async function addBundleItemAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "אין הרשאה" };
  }

  const bundleProductId = String(formData.get("bundle_product_id") ?? "").trim();
  const itemProductId = String(formData.get("item_product_id") ?? "").trim();
  const quantity = Number.parseInt(String(formData.get("quantity") ?? "1"), 10) || 1;

  if (!bundleProductId || !itemProductId || quantity < 1) {
    return { error: "שדות חסרים או כמות לא תקינה" };
  }

  const [bundle, item] = await Promise.all([
    prisma.product.findUnique({ where: { id: bundleProductId } }),
    prisma.product.findUnique({ where: { id: itemProductId } }),
  ]);

  if (!bundle || bundle.product_type !== ProductType.bundle) {
    return { error: "מוצר המארז לא תקין" };
  }
  if (!item || item.product_type !== ProductType.standard) {
    return { error: "ניתן להוסיף רק מוצרים רגילים למארז" };
  }

  await prisma.bundleItem.upsert({
    where: {
      bundle_product_id_item_product_id: {
        bundle_product_id: bundleProductId,
        item_product_id: itemProductId,
      },
    },
    create: {
      bundle_product_id: bundleProductId,
      item_product_id: itemProductId,
      quantity,
    },
    update: { quantity },
  });

  revalidatePath(`/admin/products/${bundleProductId}`);
  return { success: true };
}

export async function removeBundleItemAction(bundleProductId: string, itemId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  await prisma.bundleItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/products/${bundleProductId}`);
}

export async function removeBundleItemFormAction(formData: FormData) {
  const bundleProductId = String(formData.get("bundle_product_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  await removeBundleItemAction(bundleProductId, itemId);
}

export async function addProductOptionFormAction(formData: FormData) {
  await addProductOptionAction(formData);
}

export async function addOptionValueFormAction(formData: FormData) {
  await addOptionValueAction(formData);
}

export async function addBundleItemFormAction(formData: FormData) {
  await addBundleItemAction(formData);
}

export async function deleteProductImageAction(productId: string, imageId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) {
    return;
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
    const supabase = createServiceClient();
    await supabase.storage.from("product-images").remove([image.storage_path]);
  } catch {
    // Storage cleanup best-effort when env not configured
  }

  revalidatePath(`/admin/products/${productId}`);
}
