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
    <header className="sticky top-0 z-40 border-b border-mm-line bg-mm-bg/94 backdrop-blur-md">
      <div className="mm-wrap flex min-h-[4.25rem] items-center justify-between gap-4 py-3">
        <div className="flex flex-1 items-center gap-3 text-sm text-mm-secondary">
          <LanguageSwitcher locale={locale} />
          <CartBadge locale={locale} label={messages.navCart} />
          {isLoggedIn ? (
            <form action={logoutCustomer}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="hidden cursor-pointer transition-colors hover:text-mm-primary sm:inline"
              >
                {messages.navLogout}
              </button>
            </form>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="hidden cursor-pointer transition-colors hover:text-mm-primary sm:inline"
            >
              {messages.navLogin}
            </Link>
          )}
        </div>

        <Link
          href={`/${locale}`}
          className="font-heading text-center text-[1.75rem] font-semibold leading-tight tracking-wide text-mm-primary cursor-pointer"
        >
          {messages.brand}
          <span className="mt-[-0.1rem] block font-[family-name:var(--font-body)] text-[0.62rem] font-normal uppercase tracking-[0.14em] text-mm-secondary">
            {messages.brandTagline}
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-end gap-4 text-sm text-mm-secondary">
          <Link
            href={`/${locale}`}
            className="cursor-pointer transition-colors hover:text-mm-primary"
          >
            {messages.navHome}
          </Link>
          <Link
            href={`/${locale}/catalog`}
            className="cursor-pointer transition-colors hover:text-mm-primary"
          >
            {messages.navCatalog}
          </Link>
          {!isLoggedIn ? (
            <Link
              href={`/${locale}/register`}
              className="hidden cursor-pointer rounded-full bg-mm-dark px-3 py-1.5 text-white transition-colors hover:bg-mm-primary md:inline"
            >
              {messages.navRegister}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
