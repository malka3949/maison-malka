import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { getCustomerProfileForCheckout } from "@/lib/actions/orders";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

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
  const messages = getMessages(locale);
  const prefill = await getCustomerProfileForCheckout();

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-4xl text-mm-primary">{messages.checkoutTitle}</h1>
      <CheckoutForm locale={locale} messages={messages} prefill={prefill} />
    </div>
  );
}
