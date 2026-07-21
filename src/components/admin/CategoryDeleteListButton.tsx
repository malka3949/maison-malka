"use client";

import { useActionState, useState } from "react";
import {
  deleteCategoryAction,
  type DeleteCategoryState,
} from "@/lib/actions/categories";
import { adminUi } from "@/lib/admin-ui";

const initialState: DeleteCategoryState = {};

type CategoryOption = { id: string; label: string };

type CategoryDeleteListButtonProps = {
  categoryId: string;
  productCount: number;
  otherCategories: CategoryOption[];
};

export function CategoryDeleteListButton({
  categoryId,
  productCount,
  otherCategories,
}: CategoryDeleteListButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteCategoryAction,
    initialState,
  );
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState(otherCategories[0]?.id ?? "");

  const needsTarget = productCount > 0;
  const canDelete = !needsTarget || (otherCategories.length > 0 && Boolean(targetId));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-sm text-red-700 hover:underline"
      >
        מחק
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-1 space-y-2 rounded-md border border-red-100 bg-red-50/50 p-2"
      onSubmit={(event) => {
        const message =
          productCount > 0
            ? `למחוק ולהעביר ${productCount} מוצרים לקטגוריית היעד?`
            : "למחוק את הקטגוריה לצמיתות?";
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={categoryId} />
      {needsTarget ? (
        otherCategories.length === 0 ? (
          <p className="text-xs text-red-600">אין קטגוריה אחרת להעברה</p>
        ) : (
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
        )
      ) : null}
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !canDelete}
          className="cursor-pointer text-xs font-medium text-red-800 hover:underline disabled:opacity-60"
        >
          {pending ? "..." : "אישור מחיקה"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer text-xs text-mm-secondary hover:underline"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
