import { createHmac, timingSafeEqual } from "crypto";

/** Normalize email for consent keys and audience matching. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function unsubscribeSecret(): string | null {
  const dedicated = process.env.CAMPAIGN_UNSUBSCRIBE_SECRET?.trim();
  if (dedicated) return dedicated;
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return fallback || null;
}

function hmacEmail(email: string, secret: string): string {
  return createHmac("sha256", secret).update(email).digest("base64url");
}

/**
 * Create an unsubscribe token for a normalized email.
 * Format: base64url(email).hmac
 */
export function createUnsubscribeToken(email: string): string | null {
  const normalized = normalizeEmail(email);
  const secret = unsubscribeSecret();
  if (!secret || !normalized) return null;
  const payload = Buffer.from(normalized, "utf8").toString("base64url");
  return `${payload}.${hmacEmail(normalized, secret)}`;
}

/** Verify token; returns normalized email or null. */
export function verifyUnsubscribeToken(token: string): string | null {
  const secret = unsubscribeSecret();
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;
  let email: string;
  try {
    email = normalizeEmail(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!email || !email.includes("@")) return null;
  const expected = hmacEmail(email, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return email;
}
