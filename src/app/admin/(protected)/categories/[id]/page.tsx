import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryDeleteForm } from "@/components/admin/CategoryDeleteForm";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sort_order: "asc" },
      include: { translations: true },
    }),
  ]);

  if (!category) {
    notFound();
  }

  const otherCategories = allCategories
    .filter((item) => item.id !== category.id)
    .map((item) => ({
      id: item.id,
      label: item.translations.find((t) => t.locale === "he")?.name ?? item.slug,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>עריכת קטגוריה</h1>
        <Link href="/admin/categories" className={adminUi.link}>
          חזרה לרשימה
        </Link>
      </div>
      <CategoryForm category={category} />
      <CategoryDeleteForm
        categoryId={category.id}
        productCount={category._count.products}
        otherCategories={otherCategories}
      />
    </div>
  );
}
