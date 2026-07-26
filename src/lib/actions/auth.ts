"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncUserFromAuth } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin");
  const nextPath = nextRaw.split("?")[0].split("#")[0];
  // Normalize and allow only under /admin (blocks /admin/../he etc.)
  const segments = nextPath.split("/").filter((s) => s && s !== ".");
  const safe =
    segments[0] === "admin" && !segments.includes("..")
      ? `/${segments.join("/")}`
      : "/admin";
  const next = safe === "/admin" || safe.startsWith("/admin/") ? safe : "/admin";

  if (!email || !password) {
    return { error: "נא למלא אימייל וסיסמה" };
  }

  const { rateLimitConsume } = await import("@/lib/rate-limit");
  const limited = rateLimitConsume(`admin-login:${email.toLowerCase()}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return { error: "נסיונות רבים מדי. נסו שוב בעוד כמה דקות." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "התחברות נכשלה. בדקו את הפרטים." };
  }

  await syncUserFromAuth(data.user.id, data.user.email ?? email);

  const appUser = await import("@/lib/prisma").then((m) =>
    m.prisma.user.findUnique({ where: { id: data.user!.id } }),
  );

  if (!appUser || appUser.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "אין הרשאות מנהל לחשבון זה." };
  }

  redirect(next);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function revalidateAdminPaths() {
  const { requireAdmin } = await import("@/lib/auth");
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}
