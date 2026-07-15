import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/storefront/AnnouncementBar";
import { CartProvider } from "@/components/storefront/CartProvider";
import { HtmlLangDir } from "@/components/storefront/HtmlLangDir";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { getSessionUser } from "@/lib/auth";
import { getMessages, isLocale, localeDir, type Locale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const messages = getMessages(locale);
  const user = await getSessionUser();

  return (
    <CartProvider>
      <HtmlLangDir locale={locale} />
      <div
        dir={localeDir(locale)}
        lang={locale}
        className="flex min-h-screen flex-col bg-mm-bg text-mm-text"
      >
        <AnnouncementBar text={messages.announcement} />
        <StorefrontHeader
          locale={locale}
          messages={messages}
          isLoggedIn={Boolean(user)}
        />
        <main className="w-full flex-1 pb-16">{children}</main>
        <StorefrontFooter messages={messages} />
      </div>
    </CartProvider>
  );
}
