"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncUserFromAuth } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "נא למלא אימייל וסיסמה" };
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

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}
