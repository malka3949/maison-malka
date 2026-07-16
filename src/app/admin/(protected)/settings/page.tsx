import { SiteSettingsAdmin } from "@/components/admin/SiteSettingsAdmin";
import { adminUi } from "@/lib/admin-ui";
import { loadSiteSettingsMap } from "@/lib/site-cms";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const values = await loadSiteSettingsMap();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminUi.h1}>הגדרות עסק</h1>
        <p className={adminUi.muted}>
          כתובת איסוף, טלפון, שעות והערת lead-time (שיווק בלבד — לא משנה ולידציית הזמנות).
        </p>
      </div>
      <SiteSettingsAdmin values={values} />
    </div>
  );
}
