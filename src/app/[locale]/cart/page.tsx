import { notFound } from "next/navigation";
import { CartView } from "@/components/storefront/CartView";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

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
  const messages = getMessages(locale);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-4xl text-mm-primary">{messages.cartTitle}</h1>
      <CartView locale={locale} messages={messages} />
    </div>
  );
}
