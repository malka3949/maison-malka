import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { adminUi } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>עריכת קטגוריה</h1>
        <Link href="/admin/categories" className={adminUi.link}>
          חזרה לרשימה
        </Link>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
