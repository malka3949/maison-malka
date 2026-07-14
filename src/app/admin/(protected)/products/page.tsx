import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { toggleProductAvailabilityFormAction } from "@/lib/actions/products";
import { CategoryFilter } from "@/components/admin/CategoryFilter";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryFilter } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: categoryFilter ? { category_id: categoryFilter } : undefined,
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
      include: {
        translations: true,
        category: { include: { translations: true } },
        images: { take: 1, orderBy: { sort_order: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sort_order: "asc" },
      include: { translations: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>מוצרים</h1>
        <Link href="/admin/products/new" className={adminUi.btnPrimary}>
          מוצר חדש
        </Link>
      </div>
      <Suspense fallback={<p className={`text-sm ${adminUi.muted}`}>טוען סינון...</p>}>
        <CategoryFilter
          categories={categories.map((category) => ({
            id: category.id,
            label:
              category.translations.find((t) => t.locale === "he")?.name ?? category.slug,
          }))}
          selectedId={categoryFilter}
        />
      </Suspense>
      <div className={adminUi.table}>
        <table className="min-w-full text-sm">
          <thead className={adminUi.tableHead}>
            <tr>
              <th className="px-4 py-3 text-right font-medium">שם</th>
              <th className="px-4 py-3 text-right font-medium">קטגוריה</th>
              <th className="px-4 py-3 text-right font-medium">סוג</th>
              <th className="px-4 py-3 text-right font-medium">מחיר</th>
              <th className="px-4 py-3 text-right font-medium">זמינות</th>
              <th className="px-4 py-3 text-right font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const name =
                product.translations.find((t) => t.locale === "he")?.name ??
                product.translations[0]?.name ??
                "—";
              const categoryName =
                product.category.translations.find((t) => t.locale === "he")?.name ??
                product.category.slug;
              return (
                <tr key={product.id} className={adminUi.tableRow}>
                  <td className="px-4 py-3">{name}</td>
                  <td className="px-4 py-3">{categoryName}</td>
                  <td className="px-4 py-3">
                    {product.product_type === "bundle" ? "מארז" : "רגיל"}
                  </td>
                  <td className={`px-4 py-3 ${adminUi.price}`}>₪{product.base_price.toString()}</td>
                  <td className="px-4 py-3">
                    <form action={toggleProductAvailabilityFormAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <input
                        type="hidden"
                        name="is_available"
                        value={String(product.is_available)}
                      />
                      <button
                        type="submit"
                        className={`cursor-pointer ${
                          product.is_available ? adminUi.badgeOn : adminUi.badgeOff
                        }`}
                      >
                        {product.is_available ? "זמין" : "לא זמין"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${product.id}`} className={adminUi.link}>
                      עריכה
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className={`px-4 py-8 text-center ${adminUi.muted}`}>אין מוצרים עדיין</p>
        ) : null}
      </div>
    </div>
  );
}
