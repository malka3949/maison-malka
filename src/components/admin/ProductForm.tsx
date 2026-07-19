"use client";

import { useActionState, useState, useTransition } from "react";
import { upsertProductAction, type ProductFormState } from "@/lib/actions/products";
import { translateProductNameAction } from "@/lib/actions/product-translate";
import {
  suggestProductDescriptions,
  translateProductNameToEnglish,
} from "@/lib/ai/product-description";
import { adminUi } from "@/lib/admin-ui";

const initialState: ProductFormState = {};

type ProductFormProps = {
  categories: { id: string; label: string }[];
  product?: {
    id: string;
    category_id: string;
    product_type: "standard" | "bundle";
    base_price: string;
    is_available: boolean;
    sort_order: number;
    translations: { locale: string; name: string; description: string }[];
  };
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const initialNameHe =
    product?.translations.find((t) => t.locale === "he")?.name ?? "";
  const initialNameEn =
    product?.translations.find((t) => t.locale === "en")?.name ?? "";
  const initialDescriptionHe =
    product?.translations.find((t) => t.locale === "he")?.description ?? "";
  const initialDescriptionEn =
    product?.translations.find((t) => t.locale === "en")?.description ?? "";

  const [nameHe, setNameHe] = useState(initialNameHe);
  const [nameEn, setNameEn] = useState(initialNameEn);
  const [descriptionHe, setDescriptionHe] = useState(initialDescriptionHe);
  const [descriptionEn, setDescriptionEn] = useState(initialDescriptionEn);
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [productType, setProductType] = useState<"standard" | "bundle">(
    product?.product_type ?? "standard",
  );
  const [suggestNote, setSuggestNote] = useState<string | null>(null);
  const [translatePending, startTranslate] = useTransition();

  const [state, formAction, pending] = useActionState(upsertProductAction, initialState);

  function applyLocalNameHint() {
    if (nameEn.trim()) return;
    const suggested = translateProductNameToEnglish(nameHe);
    if (suggested) {
      setNameEn(suggested);
      setSuggestNote(null);
    } else if (nameHe.trim()) {
      setSuggestNote(
        "אין תרגום מקומי מדויק — לחצו «תרגם לאנגלית» (מילון או Gemini חינמי) או מלאו ידנית.",
      );
    }
  }

  function handleTranslateName() {
    if (!nameHe.trim()) {
      setSuggestNote("מלאו קודם שם בעברית.");
      return;
    }
    if (
      nameEn.trim() &&
      !window.confirm("יש כבר שם באנגלית. להחליף בתרגום?")
    ) {
      return;
    }

    startTranslate(async () => {
      const result = await translateProductNameAction(nameHe);
      if (!result.ok) {
        setSuggestNote(result.error);
        return;
      }
      setNameEn(result.nameEn);
      setSuggestNote(
        result.source === "local"
          ? "תורגם מהמילון המקומי (חינמי, בלי רשת)."
          : "תורגם עם Gemini (שכבה חינמית). אפשר לערוך לפני שמירה.",
      );
    });
  }

  function handleSuggestDescription() {
    if (!nameHe.trim() && !nameEn.trim()) {
      setSuggestNote("מלאו קודם שם בעברית או באנגלית.");
      return;
    }

    const hasExisting =
      descriptionHe.trim().length > 0 || descriptionEn.trim().length > 0;
    if (
      hasExisting &&
      !window.confirm("יש כבר תיאור. להחליף בהצעה החדשה?")
    ) {
      return;
    }

    const categoryLabel =
      categories.find((c) => c.id === categoryId)?.label ?? "";
    const suggestion = suggestProductDescriptions({
      nameHe,
      nameEn,
      categoryLabel,
      productType,
    });

    setDescriptionHe(suggestion.he);
    setDescriptionEn(suggestion.en);
    setSuggestNote("הוצעו תיאורים בעברית ובאנגלית. אפשר לערוך לפני שמירה.");
  }

  return (
    <form action={formAction} className={`space-y-4 ${adminUi.card}`}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">קטגוריה</label>
          <select
            name="category_id"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
            className={adminUi.input}
          >
            <option value="">בחרו קטגוריה</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">סוג מוצר</label>
          <select
            name="product_type"
            value={productType}
            onChange={(event) =>
              setProductType(event.target.value as "standard" | "bundle")
            }
            className={adminUi.input}
          >
            <option value="standard">מוצר רגיל</option>
            <option value="bundle">מארז</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">שם (עברית)</label>
          <input
            name="name_he"
            value={nameHe}
            onChange={(event) => setNameHe(event.target.value)}
            onBlur={applyLocalNameHint}
            required
            className={adminUi.input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">שם (אנגלית)</label>
          <input
            name="name_en"
            value={nameEn}
            onChange={(event) => setNameEn(event.target.value)}
            required
            className={adminUi.input}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTranslateName}
              disabled={translatePending}
              className={adminUi.btnSecondary}
            >
              {translatePending ? "מתרגם..." : "תרגם לאנגלית"}
            </button>
            <p className={`text-xs ${adminUi.muted}`}>
              מילון מקומי חינמי; אם אין התאמה — Gemini חינמי (רק עם GEMINI_API_KEY).
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm ${adminUi.muted}`}>
          הצעת תיאור מקומית (בלי API) — לפי שם, קטגוריה וסוג מוצר.
        </p>
        <button
          type="button"
          onClick={handleSuggestDescription}
          className={adminUi.btnSecondary}
        >
          הצע תיאור
        </button>
      </div>
      {suggestNote ? (
        <p className={`text-sm ${adminUi.muted}`} role="status">
          {suggestNote}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">תיאור (עברית)</label>
          <textarea
            name="description_he"
            value={descriptionHe}
            onChange={(event) => setDescriptionHe(event.target.value)}
            rows={4}
            className={adminUi.input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">תיאור (אנגלית)</label>
          <textarea
            name="description_en"
            value={descriptionEn}
            onChange={(event) => setDescriptionEn(event.target.value)}
            rows={4}
            className={adminUi.input}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">מחיר בסיס (₪)</label>
          <input
            name="base_price"
            type="text"
            inputMode="decimal"
            defaultValue={product?.base_price ?? ""}
            required
            className={adminUi.input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">סדר תצוגה</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={product?.sort_order ?? 0}
            className={adminUi.input}
          />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_available"
              defaultChecked={product?.is_available ?? true}
            />
            זמין למכירה
          </label>
        </div>
      </div>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-700">נשמר בהצלחה</p> : null}
      {!product ? (
        <p className={`rounded-md border border-dashed border-mm-line bg-mm-soft/60 px-3 py-2 text-sm ${adminUi.muted}`}>
          אחרי יצירת המוצר תעברו אוטומטית למסך שבו אפשר להעלות תמונות.
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={adminUi.btnPrimary}>
        {pending ? "שומר..." : product ? "עדכון" : "יצירה והמשך להעלאת תמונה"}
      </button>
    </form>
  );
}
