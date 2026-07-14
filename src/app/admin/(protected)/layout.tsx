import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/auth";
import { adminUi } from "@/lib/admin-ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "לוח בקרה" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/products", label: "מוצרים" },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className={adminUi.page}>
      <header className={adminUi.header}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className={adminUi.brand}>
              Maison Malka
              <span className="mr-2 font-sans text-sm font-normal text-mm-secondary">— ניהול</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={adminUi.navLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={logoutAction}>
            <button type="submit" className={adminUi.btnSecondary}>
              התנתקות
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
