"use client";

import { useActionState, useState } from "react";
import {
  rejectOrderFormAction,
  type RejectionFormState,
} from "@/lib/actions/admin-orders";
import { adminUi } from "@/lib/admin-ui";
import {
  MAX_CUSTOM_REJECTION_REASON_LENGTH,
  REJECTION_REASON_OPTIONS,
} from "@/lib/orders/rejection-reasons";

const initialState: RejectionFormState = {};

export function OrderRejectionForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    rejectOrderFormAction,
    initialState,
  );
  const [reasonCode, setReasonCode] = useState<string>(
    REJECTION_REASON_OPTIONS[0]?.value ?? "availability",
  );

  return (
    <form action={action} className="space-y-2 rounded-md border border-stone-200 p-3">
      <input type="hidden" name="id" value={orderId} />
      <label className="block text-sm">
        <span className={`mb-1 block ${adminUi.muted}`}>סיבת הדחייה</span>
        <select
          name="reasonCode"
          value={reasonCode}
          onChange={(event) => setReasonCode(event.target.value)}
          className={adminUi.select}
          required
        >
          {REJECTION_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {reasonCode === "other" ? (
        <label className="block text-sm">
          <span className={`mb-1 block ${adminUi.muted}`}>פירוט ללקוח</span>
          <textarea
            name="customReason"
            required
            maxLength={MAX_CUSTOM_REJECTION_REASON_LENGTH}
            rows={3}
            className={adminUi.input}
          />
        </label>
      ) : (
        <input type="hidden" name="customReason" value="" />
      )}
      <button
        type="submit"
        className={adminUi.btnSecondary}
        disabled={pending}
      >
        {pending ? "דוחה..." : "דחיית הזמנה ושליחת סיבה"}
      </button>
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}
