import { notFound } from "next/navigation";
import { LegalDocumentView } from "@/components/storefront/LegalDocumentView";
import { getLegalDocument } from "@/content/legal";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  return (
    <div className="mm-wrap mm-page">
      <LegalDocumentView doc={getLegalDocument("privacy", locale)} />
    </div>
  );
}
