"use client";

import { useActionState } from "react";
import {
  deleteProductAction,
  type DeleteProductState,
} from "@/lib/actions/products";
import { adminUi } from "@/lib/admin-ui";

const initialState: DeleteProductState = {};

export function ProductDeleteForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={`space-y-3 ${adminUi.card} border-red-100`}
      onSubmit={(event) => {
        if (!window.confirm("למחוק את המוצר לצמיתות? אם יש הזמנות או מארזים — המחיקה תיחסם.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <h2 className={adminUi.h2}>מחיקת מוצר</h2>
      <p className={`text-sm ${adminUi.muted}`}>
        להסתרה מהאתר השתמשו ב״זמין / לא זמין״. מחיקה אפשרית רק אם אין הזמנות ואין
        שיוך למארז.
      </p>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "מוחק..." : "מחק מוצר"}
      </button>
    </form>
  );
}
