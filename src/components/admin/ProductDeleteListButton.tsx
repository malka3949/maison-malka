"use client";

import { useActionState } from "react";
import {
  deleteProductAction,
  type DeleteProductState,
} from "@/lib/actions/products";

const initialState: DeleteProductState = {};

/** Compact delete control for the products list row. */
export function ProductDeleteListButton({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteProductAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="inline"
      onSubmit={(event) => {
        if (!window.confirm("למחוק את המוצר לצמיתות?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer text-sm text-red-700 hover:underline disabled:opacity-60"
        title={state.error}
      >
        {pending ? "..." : "מחק"}
      </button>
      {state.error ? (
        <span className="mr-2 block text-xs text-red-600">{state.error}</span>
      ) : null}
    </form>
  );
}
