/**
 * Optional free-tier Gemini translation (server-only).
 * Requires GEMINI_API_KEY from Google AI Studio free quota.
 * Never expose the key to the client.
 */

export type GeminiTranslateResult =
  | { ok: true; text: string }
  | { ok: false; error: "not_configured" | "blocked_or_network" | "bad_response" | "quota" };

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function sanitizeModelText(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .split("\n")[0]
    .trim();
}

export async function translateBakeryNameWithGemini(
  hebrewName: string,
): Promise<GeminiTranslateResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "not_configured" };
  }

  const prompt = [
    "Translate this Israeli bakery product name from Hebrew to English.",
    "Return ONLY the English product name.",
    "Keep it short, natural, and suitable for an e-commerce product title.",
    "Do not transliterate letter-by-letter.",
    "Do not add quotes, explanations, or punctuation beyond the name.",
    `Hebrew name: ${hebrewName}`,
  ].join("\n");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 40,
        },
      }),
    });

    if (res.status === 429) {
      return { ok: false, error: "quota" };
    }
    if (!res.ok) {
      return { ok: false, error: "blocked_or_network" };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = sanitizeModelText(
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    );

    if (!text || /[\u0590-\u05ff]/.test(text)) {
      return { ok: false, error: "bad_response" };
    }

    return { ok: true, text };
  } catch {
    return { ok: false, error: "blocked_or_network" };
  }
}
