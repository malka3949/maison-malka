import { notFound } from "next/navigation";
import { CartView } from "@/components/storefront/CartView";
import { isLocale, type Locale } from "@/lib/i18n";
import { loadMergedStorefrontMessages } from "@/lib/site-cms";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = await loadMergedStorefrontMessages(locale);

  return (
    <div className="mm-wrap mm-page space-y-6">
      <h1 className="mm-page-title font-heading">{messages.cartTitle}</h1>
      <CartView locale={locale} messages={messages} />
    </div>
  );
}
