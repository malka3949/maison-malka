import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductDeleteForm } from "@/components/admin/ProductDeleteForm";
import { ImageUploadSection } from "@/components/admin/ImageUploadSection";
import { ProductOptionsSection } from "@/components/admin/ProductOptionsSection";
import { BundleItemsSection } from "@/components/admin/BundleItemsSection";
import { getProductImagePublicUrl } from "@/lib/storefront";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const [product, categories, standardProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        images: { orderBy: { sort_order: "asc" } },
        options: {
          orderBy: { sort_order: "asc" },
          include: { values: true },
        },
        bundle_items: {
          include: {
            item_product: { include: { translations: true } },
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { sort_order: "asc" },
      include: { translations: true },
    }),
    prisma.product.findMany({
      where: { product_type: "standard" },
      include: { translations: true },
      orderBy: { sort_order: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    label: category.translations.find((t) => t.locale === "he")?.name ?? category.slug,
  }));

  const standardProductOptions = standardProducts.map((p) => ({
    id: p.id,
    label: p.translations.find((t) => t.locale === "he")?.name ?? p.id,
  }));

  const images = product.images.map((image) => ({
    id: image.id,
    storage_path: image.storage_path,
    public_url:
      getProductImagePublicUrl(image.storage_path) ?? image.storage_path,
    alt_text: image.alt_text,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>עריכת מוצר</h1>
        <Link href="/admin/products" className={adminUi.link}>
          חזרה לרשימה
        </Link>
      </div>
      {created === "1" ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          המוצר נוצר בהצלחה. עכשיו אפשר להעלות תמונה בקטע «תמונות מוצר» למטה.
        </p>
      ) : null}
      <ProductForm
        categories={categoryOptions}
        product={{
          id: product.id,
          category_id: product.category_id,
          product_type: product.product_type,
          base_price: product.base_price.toString(),
          is_available: product.is_available,
          sort_order: product.sort_order,
          translations: product.translations,
        }}
      />
      <ImageUploadSection productId={product.id} images={images} />
      {product.product_type === "standard" ? (
        <ProductOptionsSection
          productId={product.id}
          options={product.options.map((option) => ({
            id: option.id,
            name_key: option.name_key,
            is_required: option.is_required,
            sort_order: option.sort_order,
            values: option.values.map((value) => ({
              id: value.id,
              label_key: value.label_key,
              price_delta: value.price_delta.toString(),
              is_default: value.is_default,
            })),
          }))}
        />
      ) : (
        <BundleItemsSection
          bundleProductId={product.id}
          items={product.bundle_items}
          standardProducts={standardProductOptions}
        />
      )}
      <ProductDeleteForm productId={product.id} />
    </div>
  );
}
