import { UserRole } from "@prisma/client";

export function isAdminEmail(email: string, adminEmail: string | undefined): boolean {
  if (!adminEmail) {
    return false;
  }
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export function resolveUserRole(email: string, adminEmail: string | undefined): UserRole {
  return isAdminEmail(email, adminEmail) ? UserRole.admin : UserRole.customer;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePrice(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(",", "."));
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Phone photos are often 6–12MB; keep a practical admin limit. */
export const MAX_IMAGE_SIZE_MB = 15;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "image";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
