"use client";

import { useActionState } from "react";
import {
  upsertImageSlotsAction,
  upsertSiteTextBlocksAction,
  type SiteFormState,
} from "@/lib/actions/site-cms";
import { adminUi } from "@/lib/admin-ui";
import {
  SITE_IMAGE_SLOT_KEYS,
  SITE_TEXT_KEYS,
  type SiteImageSlotKey,
  type SiteTextKey,
} from "@/lib/site-content";

const initial: SiteFormState = {};

const GROUPS: { title: string; keys: SiteTextKey[] }[] = [
  { title: "הודעת ראש", keys: ["announcement"] },
  {
    title: "Hero",
    keys: [
      "hero.eyebrow",
      "hero.title",
      "hero.subtitle",
      "hero.cta_primary",
      "hero.cta_secondary",
    ],
  },
  { title: "Ticker (שורה לכל פריט)", keys: ["ticker"] },
  {
    title: "Promo — catalog",
    keys: [
      "promo.catalog.label",
      "promo.catalog.title",
      "promo.catalog.body",
      "promo.catalog.cta",
    ],
  },
  {
    title: "Promo — gift",
    keys: [
      "promo.gift.label",
      "promo.gift.title",
      "promo.gift.body",
      "promo.gift.cta",
    ],
  },
  {
    title: "Trust",
    keys: [
      "trust.delivery",
      "trust.delivery_sub",
      "trust.pickup",
      "trust.pickup_sub",
      "trust.handmade",
      "trust.handmade_sub",
      "trust.approval",
      "trust.approval_sub",
    ],
  },
  {
    title: "CTA סופי",
    keys: ["final_cta.title", "final_cta.body", "final_cta.button"],
  },
  { title: "Footer", keys: ["footer.tagline", "footer.hours_note"] },
];

type MediaOption = { id: string; label: string };

export function SiteContentAdmin({
  locale,
  values,
  imageSlots,
  mediaOptions,
}: {
  locale: "he" | "en";
  values: Record<string, string>;
  imageSlots: Record<SiteImageSlotKey, string>;
  mediaOptions: MediaOption[];
}) {
  const [textState, textAction, textPending] = useActionState(
    upsertSiteTextBlocksAction,
    initial,
  );
  const [imgState, imgAction, imgPending] = useActionState(
    upsertImageSlotsAction,
    initial,
  );

  return (
    <div className="space-y-8">
      <form action={textAction} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        {GROUPS.map((g) => (
          <section key={g.title} className={adminUi.section}>
            <h2 className={adminUi.h2}>{g.title}</h2>
            <div className="space-y-3">
              {g.keys.map((key) => (
                <label key={key} className="block text-sm">
                  <span className="mb-1 block text-mm-secondary">{key}</span>
                  {key === "ticker" || key.includes("subtitle") || key.includes("body") ? (
                    <textarea
                      name={key}
                      defaultValue={values[key] ?? ""}
                      rows={key === "ticker" ? 4 : 2}
                      className={adminUi.input}
                    />
                  ) : (
                    <input
                      name={key}
                      defaultValue={values[key] ?? ""}
                      className={adminUi.input}
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}
        <button type="submit" className={adminUi.btnPrimary} disabled={textPending}>
          שמור טקסטים ({locale})
        </button>
        {textState.success ? (
          <p className="text-sm text-green-700">נשמר</p>
        ) : null}
        {textState.error ? (
          <p className="text-sm text-red-600">{textState.error}</p>
        ) : null}
      </form>

      {locale === "he" ? (
        <form action={imgAction} className={adminUi.section}>
          <h2 className={adminUi.h2}>תמונות (משותף לכל השפות)</h2>
          <div className="space-y-3">
            {SITE_IMAGE_SLOT_KEYS.map((key) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block text-mm-secondary">{key}</span>
                <select
                  name={key}
                  defaultValue={imageSlots[key] ?? ""}
                  className={adminUi.select + " w-full"}
                >
                  <option value="">— ברירת מחדל (placeholder) —</option>
                  {mediaOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className={`${adminUi.btnPrimary} mt-4`}
            disabled={imgPending}
          >
            שמור שיוך תמונות
          </button>
          {imgState.success ? (
            <p className="text-sm text-green-700">נשמר</p>
          ) : null}
          {imgState.error ? (
            <p className="text-sm text-red-600">{imgState.error}</p>
          ) : null}
        </form>
      ) : null}

      <p className={adminUi.muted + " text-xs"}>
        מפתחות מותרים בלבד ({SITE_TEXT_KEYS.length} טקסט). שדה ריק = נפילה ל־messages.
      </p>
    </div>
  );
}
