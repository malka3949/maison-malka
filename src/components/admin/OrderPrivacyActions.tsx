"use client";

import { useState, useTransition } from "react";
import {
  anonymizeOrderPiiAction,
  exportOrderPiiAction,
} from "@/lib/actions/admin-orders";
import { adminUi } from "@/lib/admin-ui";

export function OrderPrivacyActions({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className={`space-y-2 ${adminUi.card}`}>
      <h2 className={adminUi.h2}>פרטיות / בקשות נושא מידע</h2>
      <p className={`text-sm ${adminUi.muted}`}>
        ייצוא או התמה של PII לפי פנייה של הלקוח. התמה אינה הפיכה.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className={adminUi.btnSecondary}
          onClick={() => {
            start(async () => {
              const result = await exportOrderPiiAction(orderId);
              if (!result.ok) {
                setMessage("ייצוא נכשל");
                return;
              }
              const blob = new Blob([JSON.stringify(result.data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `order-${orderId}-pii.json`;
              a.click();
              URL.revokeObjectURL(url);
              setMessage("הקובץ הורד");
            });
          }}
        >
          ייצוא JSON
        </button>
        <button
          type="button"
          disabled={pending}
          className="cursor-pointer rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-800 hover:bg-red-100 disabled:opacity-60"
          onClick={() => {
            if (
              !window.confirm(
                "להתם את פרטי הלקוח בהזמנה זו? לא ניתן לשחזר.",
              )
            ) {
              return;
            }
            start(async () => {
              const result = await anonymizeOrderPiiAction(orderId);
              setMessage(result.ok ? "הפרטים הוסתרו" : "התמה נכשלה");
              if (result.ok) window.location.reload();
            });
          }}
        >
          התמת פרטים
        </button>
      </div>
      {message ? <p className="text-sm text-mm-secondary">{message}</p> : null}
    </div>
  );
}
