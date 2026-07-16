"use client";

import { useActionState } from "react";
import {
  upsertSiteSettingsAction,
  type SiteFormState,
} from "@/lib/actions/site-cms";
import { adminUi } from "@/lib/admin-ui";
import { SITE_SETTINGS_KEYS, type SiteSettingsKey } from "@/lib/site-content";

const initial: SiteFormState = {};

const LABELS: Record<SiteSettingsKey, string> = {
  pickup_address: "כתובת איסוף",
  phone: "טלפון",
  business_hours: "שעות פעילות",
  lead_time_note: "הערת זמן אספקה (שיווק)",
};

export function SiteSettingsAdmin({
  values,
}: {
  values: Partial<Record<SiteSettingsKey, string>>;
}) {
  const [state, action, pending] = useActionState(
    upsertSiteSettingsAction,
    initial,
  );

  return (
    <form action={action} className={`${adminUi.section} max-w-xl space-y-4`}>
      {SITE_SETTINGS_KEYS.map((key) => (
        <label key={key} className="block text-sm">
          <span className="mb-1 block text-mm-secondary">
            {LABELS[key]} <span className="text-xs">({key})</span>
          </span>
          <input
            name={key}
            defaultValue={values[key] ?? ""}
            className={adminUi.input}
          />
        </label>
      ))}
      <button type="submit" className={adminUi.btnPrimary} disabled={pending}>
        שמור הגדרות
      </button>
      {state.success ? <p className="text-sm text-green-700">נשמר</p> : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
    </form>
  );
}
