import { SiteMediaAdmin } from "@/components/admin/SiteMediaAdmin";
import { adminUi } from "@/lib/admin-ui";
import { prisma } from "@/lib/prisma";
import { getSiteMediaPublicUrl } from "@/lib/site-media-url";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await prisma.siteMedia.findMany({
    orderBy: { created_at: "desc" },
  });

  const items = media.map((m) => ({
    id: m.id,
    storage_path: m.storage_path,
    alt_he: m.alt_he,
    alt_en: m.alt_en,
    public_url: getSiteMediaPublicUrl(m.storage_path) ?? "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className={adminUi.h1}>מדיה — אתר</h1>
        <p className={adminUi.muted}>
          העלאה / עריכת alt / מחיקה ל־bucket site-media (לא תמונות מוצר).
        </p>
      </div>
      <SiteMediaAdmin items={items} />
    </div>
  );
}
