import type { Locale } from "@/lib/i18n";
import {
  cancellationEn,
  cancellationHe,
} from "@/content/legal/cancellation";
import { privacyEn, privacyHe, type LegalDocument } from "@/content/legal/privacy";
import { termsEn, termsHe } from "@/content/legal/terms";

/** Bump when legal templates change in a material way (stored on orders at consent). */
export const LEGAL_CONSENT_VERSION = "2026-07-22";

export type LegalSlug = "privacy" | "terms" | "cancellation";

export function getLegalDocument(
  slug: LegalSlug,
  locale: Locale,
): LegalDocument {
  if (slug === "privacy") {
    return locale === "en" ? privacyEn : privacyHe;
  }
  if (slug === "terms") {
    return locale === "en" ? termsEn : termsHe;
  }
  return locale === "en" ? cancellationEn : cancellationHe;
}
