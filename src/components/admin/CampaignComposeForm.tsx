"use client";

import { useActionState } from "react";
import {
  sendCampaignAction,
  type CampaignFormState,
} from "@/lib/actions/campaigns";
import { adminUi } from "@/lib/admin-ui";

const initial: CampaignFormState = {};

export function CampaignComposeForm({
  recipientCount,
}: {
  recipientCount: number;
}) {
  const [state, action, pending] = useActionState(sendCampaignAction, initial);

  return (
    <form action={action} className={`${adminUi.section} max-w-xl space-y-4`}>
      <p className="text-sm text-mm-secondary">
        נמענים עם הסכמת דיוור פעילה:{" "}
        <strong className="text-mm-primary">{recipientCount}</strong>
      </p>
      {recipientCount === 0 ? (
        <p className="text-sm text-amber-800">
          אין נמענים כרגע — נדרשת הסכמה בקופה מלקוחות שהזמינו.
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 block text-mm-secondary">נושא</span>
        <input
          name="subject"
          required
          maxLength={200}
          className={adminUi.input}
          disabled={recipientCount === 0}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-mm-secondary">תוכן (טקסט פשוט)</span>
        <textarea
          name="body"
          required
          rows={8}
          className={adminUi.input}
          disabled={recipientCount === 0}
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-mm-secondary">
        <input
          type="checkbox"
          name="confirmSend"
          className="mt-1"
          disabled={recipientCount === 0}
        />
        <span>
          אני מאשר/ת לשלוח קמפיין ל־{recipientCount} נמענים (עם קישור הסרה בכל
          מייל)
        </span>
      </label>
      <button
        type="submit"
        className={adminUi.btnPrimary}
        disabled={pending || recipientCount === 0}
      >
        {pending ? "שולח…" : "שליחת קמפיין"}
      </button>
      {state.success ? (
        <p className="text-sm text-green-700">הקמפיין נשלח (או הושלם חלקית).</p>
      ) : null}
      {state.error === "empty_audience" ? (
        <p className="text-sm text-red-600">אין נמענים לשליחה.</p>
      ) : null}
      {state.error === "confirm_required" ? (
        <p className="text-sm text-red-600">יש לאשר את תיבת האישור לפני שליחה.</p>
      ) : null}
      {state.error === "missing_fields" ? (
        <p className="text-sm text-red-600">נא למלא נושא ותוכן.</p>
      ) : null}
      {state.error === "unauthorized" ? (
        <p className="text-sm text-red-600">אין הרשאה.</p>
      ) : null}
      {state.error &&
      !["empty_audience", "confirm_required", "missing_fields", "unauthorized"].includes(
        state.error,
      ) ? (
        <p className="text-sm text-red-600">שגיאה: {state.error}</p>
      ) : null}
    </form>
  );
}
