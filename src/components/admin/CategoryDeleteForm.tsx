"use client";

import { useActionState, useState } from "react";
import {
  deleteCategoryAction,
  type DeleteCategoryState,
} from "@/lib/actions/categories";
import { adminUi } from "@/lib/admin-ui";

const initialState: DeleteCategoryState = {};

type CategoryOption = { id: string; label: string };

type CategoryDeleteFormProps = {
  categoryId: string;
  productCount: number;
  otherCategories: CategoryOption[];
};

export function CategoryDeleteForm({
  categoryId,
  productCount,
  otherCategories,
}: CategoryDeleteFormProps) {
  const [state, formAction, pending] = useActionState(
    deleteCategoryAction,
    initialState,
  );
  const [targetId, setTargetId] = useState(otherCategories[0]?.id ?? "");

  const needsTarget = productCount > 0;
  const canDelete = !needsTarget || (otherCategories.length > 0 && Boolean(targetId));

  return (
    <form
      action={formAction}
      className={`space-y-3 ${adminUi.card} border-red-100`}
      onSubmit={(event) => {
        const message =
          productCount > 0
            ? `למחוק את הקטגוריה ולהעביר ${productCount} מוצרים לקטגוריית היעד?`
            : "למחוק את הקטגוריה לצמיתות?";
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={categoryId} />
      <h2 className={adminUi.h2}>מחיקת קטגוריה</h2>
      <p className={`text-sm ${adminUi.muted}`}>
        להסתרה מהאתר השתמשו ב״פעילה״ / מתג הסטטוס. מחיקה מוחקת את הקטגוריה לצמיתות.
      </p>
      {needsTarget ? (
        otherCategories.length === 0 ? (
          <p className="text-sm text-red-600">
            יש {productCount} מוצרים בקטגוריה ואין קטגוריה אחרת להעברה. צרו קטגוריה
            נוספת לפני המחיקה.
          </p>
        ) : (
          <label className="block text-sm">
            <span className={`mb-1 block ${adminUi.muted}`}>
              העברת {productCount} מוצרים לקטגוריה
            </span>
            <select
              name="target_category_id"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              className={adminUi.select}
              required
            >
              {otherCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        )
      ) : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending || !canDelete}
        className="cursor-pointer rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "מוחק..." : "מחק קטגוריה"}
      </button>
    </form>
  );
}
