export const REJECTION_REASON_LABELS = {
  availability: {
    he: "אין זמינות לתאריך המבוקש",
    en: "There is no availability for the requested date",
  },
  product_unavailable: {
    he: "המוצר או האפשרות אינם זמינים",
    en: "The requested product or option is unavailable",
  },
  delivery_area: {
    he: "כתובת המשלוח מחוץ לאזור השירות",
    en: "The delivery address is outside our service area",
  },
  missing_details: {
    he: "חסרים פרטים בהזמנה",
    en: "Some required order details are missing",
  },
  capacity: {
    he: "אין אפשרות לקבל את ההזמנה בעומס הנוכחי",
    en: "We cannot accept the order at the current capacity",
  },
  other: {
    he: "סיבה אחרת",
    en: "Another reason",
  },
} as const;

export type RejectionReasonCode = keyof typeof REJECTION_REASON_LABELS;

export const REJECTION_REASON_OPTIONS = Object.entries(
  REJECTION_REASON_LABELS,
).map(([value, labels]) => ({
  value: value as RejectionReasonCode,
  label: labels.he,
}));

export const MAX_CUSTOM_REJECTION_REASON_LENGTH = 500;

export type ValidatedRejectionReason =
  | {
      ok: true;
      code: RejectionReasonCode;
      custom: string | null;
    }
  | {
      ok: false;
      error:
        | "invalid_reason"
        | "custom_reason_required"
        | "custom_reason_too_long";
    };

export function validateRejectionReason(
  codeValue: string,
  customValue: string,
): ValidatedRejectionReason {
  if (!(codeValue in REJECTION_REASON_LABELS)) {
    return { ok: false, error: "invalid_reason" };
  }

  const code = codeValue as RejectionReasonCode;
  const custom = customValue.trim();

  if (custom.length > MAX_CUSTOM_REJECTION_REASON_LENGTH) {
    return { ok: false, error: "custom_reason_too_long" };
  }
  if (code === "other" && !custom) {
    return { ok: false, error: "custom_reason_required" };
  }

  return {
    ok: true,
    code,
    custom: code === "other" ? custom : null,
  };
}

export function getRejectionReasonText(
  codeValue: string | null | undefined,
  customValue: string | null | undefined,
  locale: "he" | "en",
): string | null {
  if (!codeValue || !(codeValue in REJECTION_REASON_LABELS)) {
    return null;
  }

  const code = codeValue as RejectionReasonCode;
  if (code === "other") {
    return customValue?.trim() || null;
  }

  return REJECTION_REASON_LABELS[code][locale];
}
