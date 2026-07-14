import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { adminUi } from "@/lib/admin-ui";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={adminUi.h1}>קטגוריה חדשה</h1>
        <Link href="/admin/categories" className={adminUi.link}>
          חזרה לרשימה
        </Link>
      </div>
      <CategoryForm />
    </div>
  );
}
