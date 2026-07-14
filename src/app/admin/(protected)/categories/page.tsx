import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryToggle } from "@/components/admin/CategoryToggle";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    include: { translations: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>קטגוריות</h1>
        <Link href="/admin/categories/new" className={adminUi.btnPrimary}>
          קטגוריה חדשה
        </Link>
      </div>
      <div className={adminUi.table}>
        <table className="min-w-full text-sm">
          <thead className={adminUi.tableHead}>
            <tr>
              <th className="px-4 py-3 text-right font-medium">שם (HE)</th>
              <th className="px-4 py-3 text-right font-medium">שם (EN)</th>
              <th className="px-4 py-3 text-right font-medium">Slug</th>
              <th className="px-4 py-3 text-right font-medium">סדר</th>
              <th className="px-4 py-3 text-right font-medium">סטטוס</th>
              <th className="px-4 py-3 text-right font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const nameHe = category.translations.find((t) => t.locale === "he")?.name ?? "—";
              const nameEn = category.translations.find((t) => t.locale === "en")?.name ?? "—";
              return (
                <tr key={category.id} className={adminUi.tableRow}>
                  <td className="px-4 py-3">{nameHe}</td>
                  <td className="px-4 py-3">{nameEn}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mm-secondary">{category.slug}</td>
                  <td className="px-4 py-3">{category.sort_order}</td>
                  <td className="px-4 py-3">
                    <CategoryToggle id={category.id} isActive={category.is_active} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/categories/${category.id}`} className={adminUi.link}>
                      עריכה
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {categories.length === 0 ? (
          <p className={`px-4 py-8 text-center ${adminUi.muted}`}>אין קטגוריות עדיין</p>
        ) : null}
      </div>
    </div>
  );
}
