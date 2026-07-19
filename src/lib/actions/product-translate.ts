"use server";

import { requireAdmin } from "@/lib/auth";
import {
  isGeminiConfigured,
  translateBakeryNameWithGemini,
} from "@/lib/ai/gemini-translate";
import { translateProductNameToEnglish } from "@/lib/ai/product-description";

export type TranslateProductNameResult =
  | {
      ok: true;
      nameEn: string;
      source: "local" | "gemini";
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Translate Hebrew product name → English.
 * 1) Local free bakery dictionary (instant, NetFree-safe)
 * 2) Optional free Gemini key when local cannot translate
 */
export async function translateProductNameAction(
  hebrewName: string,
): Promise<TranslateProductNameResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, error: "אין הרשאה" };
  }

  const name = hebrewName.trim().replace(/\s+/g, " ");
  if (!name) {
    return { ok: false, error: "מלאו קודם שם בעברית." };
  }

  const local = translateProductNameToEnglish(name);
  if (local && !/[\u0590-\u05ff]/.test(local)) {
    return { ok: true, nameEn: local, source: "local" };
  }

  if (!isGeminiConfigured()) {
    return {
      ok: false,
      error:
        "אין תרגום מקומי מדויק, ואין מפתח Gemini חינמי מוגדר. מלאו אנגלית ידנית, או הוסיפו GEMINI_API_KEY ב-.env.local.",
    };
  }

  const ai = await translateBakeryNameWithGemini(name);
  if (ai.ok) {
    return { ok: true, nameEn: ai.text, source: "gemini" };
  }

  const messages = {
    not_configured:
      "Gemini לא מוגדר. הוסיפו GEMINI_API_KEY חינמי מ-Google AI Studio.",
    blocked_or_network:
      "לא ניתן להגיע ל-Gemini (רשת / נטפרי). השתמשו במילון או מלאו ידנית.",
    bad_response: "Gemini החזיר תשובה לא תקינה. נסו שוב או מלאו ידנית.",
    quota: "נגמרה מכסת Gemini החינמית להיום. מלאו ידנית או נסו מאוחר יותר.",
  } as const;

  return { ok: false, error: messages[ai.error] };
}
