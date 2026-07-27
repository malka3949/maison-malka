import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { getCustomerProfileForCheckout } from "@/lib/actions/orders";
import { isLocale, type Locale } from "@/lib/i18n";
import { loadMergedStorefrontMessages } from "@/lib/site-cms";

export default async function CheckoutPage({
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
  const prefill = await getCustomerProfileForCheckout();

  return (
    <div className="mm-wrap mm-page space-y-6">
      <div>
        <h1 className="mm-page-title font-heading">{messages.checkoutTitle}</h1>
        <p className="mm-page-lead">{messages.privacyNotice}</p>
      </div>
      <CheckoutForm locale={locale} messages={messages} prefill={prefill} />
    </div>
  );
}
