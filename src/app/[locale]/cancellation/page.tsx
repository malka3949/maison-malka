import { notFound } from "next/navigation";
import { LegalDocumentView } from "@/components/storefront/LegalDocumentView";
import { getLegalDocument } from "@/content/legal";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function CancellationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  return (
    <div className="mm-wrap py-10 pb-16">
      <LegalDocumentView doc={getLegalDocument("cancellation", locale)} />
    </div>
  );
}
