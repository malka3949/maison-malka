"use client";

import { useActionState } from "react";
import { upsertProductAction, type ProductFormState } from "@/lib/actions/products";
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
  const nameHe = product?.translations.find((t) => t.locale === "he")?.name ?? "";
  const nameEn = product?.translations.find((t) => t.locale === "en")?.name ?? "";
  const descriptionHe =
    product?.translations.find((t) => t.locale === "he")?.description ?? "";
  const descriptionEn =
    product?.translations.find((t) => t.locale === "en")?.description ?? "";

  const [state, formAction, pending] = useActionState(upsertProductAction, initialState);

  return (
    <form action={formAction} className={`space-y-4 ${adminUi.card}`}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">קטגוריה</label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
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
            defaultValue={product?.product_type ?? "standard"}
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
            defaultValue={nameHe}
            required
            className={adminUi.input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">שם (אנגלית)</label>
          <input
            name="name_en"
            defaultValue={nameEn}
            required
            className={adminUi.input}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">תיאור (עברית)</label>
          <textarea
            name="description_he"
            defaultValue={descriptionHe}
            rows={3}
            className={adminUi.input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-mm-primary">תיאור (אנגלית)</label>
          <textarea
            name="description_en"
            defaultValue={descriptionEn}
            rows={3}
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
