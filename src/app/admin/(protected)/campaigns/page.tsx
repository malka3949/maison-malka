import { CampaignComposeForm } from "@/components/admin/CampaignComposeForm";
import { adminUi } from "@/lib/admin-ui";
import { countCampaignAudience } from "@/lib/campaigns/consent";
import { listCampaignsForAdmin } from "@/lib/actions/campaigns";

export const dynamic = "force-dynamic";

const STATUS_HE: Record<string, string> = {
  draft: "טיוטה",
  sending: "בשליחה",
  sent: "נשלח",
  failed: "נכשל",
  partial: "חלקי",
};

export default async function AdminCampaignsPage() {
  const [recipientCount, campaigns] = await Promise.all([
    countCampaignAudience(),
    listCampaignsForAdmin(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminUi.h1}>קמפיינים</h1>
        <p className={`${adminUi.muted} mt-2`}>
          שליחת פרסומת ידנית ללקוחות שהסכימו לדיוור שיווקי.
        </p>
      </div>

      <section>
        <h2 className={adminUi.h2}>קמפיין חדש</h2>
        <div className="mt-4">
          <CampaignComposeForm recipientCount={recipientCount} />
        </div>
      </section>

      <section>
        <h2 className={adminUi.h2}>היסטוריה</h2>
        {campaigns.length === 0 ? (
          <p className={`${adminUi.muted} mt-3 text-sm`}>עדיין אין קמפיינים.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-mm-line text-right text-mm-secondary">
                  <th className="px-2 py-2 font-medium">נושא</th>
                  <th className="px-2 py-2 font-medium">מדיה</th>
                  <th className="px-2 py-2 font-medium">סטטוס</th>
                  <th className="px-2 py-2 font-medium">נמענים</th>
                  <th className="px-2 py-2 font-medium">נשלח</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-mm-line/60">
                    <td className="px-2 py-2">{c.subject}</td>
                    <td className="px-2 py-2 text-xs text-mm-secondary">
                      {[
                        c.image_storage_path ? "תמונה" : null,
                        c.pdf_storage_path ? "PDF" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="px-2 py-2">
                      {STATUS_HE[c.status] ?? c.status}
                    </td>
                    <td className="px-2 py-2">{c.recipient_count}</td>
                    <td className="px-2 py-2" dir="ltr">
                      {c.sent_at
                        ? new Date(c.sent_at).toLocaleString("he-IL")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
