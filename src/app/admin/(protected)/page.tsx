import Link from "next/link";
import { adminUi } from "@/lib/admin-ui";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminUi.h1}>לוח בקרה</h1>
        <p className={`${adminUi.muted} mt-2`}>ברוכים הבאים לניהול הקטלוג של Maison Malka.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/categories" className={adminUi.cardInteractive}>
          <h2 className={adminUi.h2}>קטגוריות</h2>
          <p className={`${adminUi.muted} mt-2 text-sm`}>ניהול קטגוריות בעברית ואנגלית</p>
        </Link>
        <Link href="/admin/products" className={adminUi.cardInteractive}>
          <h2 className={adminUi.h2}>מוצרים</h2>
          <p className={`${adminUi.muted} mt-2 text-sm`}>מוצרים, תמונות, אפשרויות ומארזים</p>
        </Link>
      </div>
    </div>
  );
}
