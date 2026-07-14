import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

async function getCategoryOptions() {
  const categories = await prisma.category.findMany({
    orderBy: { sort_order: "asc" },
    include: { translations: true },
  });
  return categories.map((category) => ({
    id: category.id,
    label: category.translations.find((t) => t.locale === "he")?.name ?? category.slug,
  }));
}

export default async function NewProductPage() {
  const categories = await getCategoryOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>מוצר חדש</h1>
        <Link href="/admin/products" className={adminUi.link}>
          חזרה לרשימה
        </Link>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
