import Link from "next/link";
import { Locale } from "@prisma/client";
import { SiteContentAdmin } from "@/components/admin/SiteContentAdmin";
import { adminUi } from "@/lib/admin-ui";
import { prisma } from "@/lib/prisma";
import { loadImageSlotAssignments } from "@/lib/site-cms";
import { SITE_TEXT_KEYS } from "@/lib/site-content";
import { getSiteMediaPublicUrl } from "@/lib/site-media-url";

export const dynamic = "force-dynamic";

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const sp = await searchParams;
  const locale = sp.locale === "en" ? "en" : "he";
  const prismaLocale = locale === "en" ? Locale.en : Locale.he;

  const [blocks, media, imageSlots] = await Promise.all([
    prisma.siteContentBlock.findMany({ where: { locale: prismaLocale } }),
    prisma.siteMedia.findMany({ orderBy: { created_at: "desc" } }),
    loadImageSlotAssignments(),
  ]);

  const values: Record<string, string> = {};
  for (const key of SITE_TEXT_KEYS) values[key] = "";
  for (const b of blocks) values[b.key] = b.value;

  const mediaOptions = media.map((m) => ({
    id: m.id,
    label: `${m.alt_he || m.alt_en || m.storage_path} (${m.id.slice(-6)})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={adminUi.h1}>תוכן אתר</h1>
          <p className={adminUi.muted}>
            עריכת טקסטים שיווקיים (HE/EN) ושיוך תמונות לפתיח / פרומו.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/admin/site?locale=he"
            className={locale === "he" ? adminUi.btnPrimary : adminUi.btnSecondary}
          >
            עברית
          </Link>
          <Link
            href="/admin/site?locale=en"
            className={locale === "en" ? adminUi.btnPrimary : adminUi.btnSecondary}
          >
            English
          </Link>
        </div>
      </div>

      <SiteContentAdmin
        locale={locale}
        values={values}
        imageSlots={imageSlots}
        mediaOptions={mediaOptions}
      />

      <p className="text-xs text-mm-secondary">
        ספריית מדיה:{" "}
        <Link href="/admin/media" className={adminUi.link}>
          /admin/media
        </Link>
        {media[0] ? (
          <>
            {" "}
            · דוגמה:{" "}
            <span dir="ltr">{getSiteMediaPublicUrl(media[0].storage_path)}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
