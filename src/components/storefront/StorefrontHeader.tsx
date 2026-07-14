import Link from "next/link";
import type { Locale, Messages } from "@/lib/i18n";
import { logoutCustomer } from "@/lib/actions/orders";
import { CartBadge } from "@/components/storefront/CartBadge";
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher";

type Props = {
  locale: Locale;
  messages: Messages;
  isLoggedIn: boolean;
};

export function StorefrontHeader({ locale, messages, isLoggedIn }: Props) {
  return (
    <header className="border-b border-stone-200/80 bg-mm-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href={`/${locale}`}
          className="font-heading text-2xl font-semibold tracking-wide text-mm-primary cursor-pointer"
        >
          {messages.brand}
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-mm-secondary">
          <Link href={`/${locale}`} className="hover:text-mm-cta cursor-pointer transition-colors">
            {messages.navHome}
          </Link>
          <Link
            href={`/${locale}/catalog`}
            className="hover:text-mm-cta cursor-pointer transition-colors"
          >
            {messages.navCatalog}
          </Link>
          <CartBadge locale={locale} label={messages.navCart} />
          <LanguageSwitcher locale={locale} />
          {isLoggedIn ? (
            <form action={logoutCustomer}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="hover:text-mm-cta cursor-pointer transition-colors">
                {messages.navLogout}
              </button>
            </form>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="hover:text-mm-cta cursor-pointer transition-colors"
              >
                {messages.navLogin}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-sm bg-mm-cta px-3 py-1.5 text-white hover:bg-mm-cta-hover cursor-pointer transition-colors"
              >
                {messages.navRegister}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
