import { prisma } from "@/lib/prisma";
import { resolveUserRole } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdmin() {
  const authUser = await getSessionUser();
  if (!authUser?.email) {
    return null;
  }

  const appUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!appUser || appUser.role !== "admin") {
    return null;
  }

  return { authUser, appUser };
}

export async function syncUserFromAuth(authUserId: string, email: string) {
  const role = resolveUserRole(email, process.env.ADMIN_EMAIL);
  return prisma.user.upsert({
    where: { id: authUserId },
    create: {
      id: authUserId,
      email,
      role,
    },
    update: {
      email,
      role,
    },
  });
}
