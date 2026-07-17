"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-mm-line bg-mm-bg">
      <div className="mm-wrap relative grid min-h-[4.35rem] grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5">
        <div className="flex items-center gap-3">
          <CartBadge locale={locale} label={messages.navCart} iconOnly />
          <LanguageSwitcher locale={locale} />
        </div>

        <Link
          href={`/${locale}`}
          className="flex flex-col items-center text-center cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <span className="font-brand text-[1.85rem] leading-none tracking-[0.04em] text-mm-primary md:text-[2.15rem]">
            {messages.brand}
          </span>
          <span className="mt-1 max-w-[11rem] text-[0.52rem] font-medium uppercase leading-tight tracking-[0.14em] text-mm-secondary">
            {messages.brandTagline} · {messages.brandSince}
          </span>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/${locale}/catalog`}
            className="hidden cursor-pointer text-sm font-medium text-mm-primary hover:opacity-70 md:inline"
          >
            {messages.navCatalog}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mm-mobile-nav"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5"
          >
            <span className={`block h-px w-5 bg-mm-primary transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-mm-primary transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-mm-primary transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mm-mobile-nav"
          className="border-t border-mm-line bg-mm-surface"
        >
          <nav className="mm-wrap flex flex-col gap-1 py-4 text-base">
            <Link
              href={`/${locale}`}
              className="cursor-pointer py-2.5 font-medium"
              onClick={() => setOpen(false)}
            >
              {messages.navHome}
            </Link>
            <Link
              href={`/${locale}/catalog`}
              className="cursor-pointer py-2.5 font-medium"
              onClick={() => setOpen(false)}
            >
              {messages.navCatalog}
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="cursor-pointer py-2.5 font-medium"
              onClick={() => setOpen(false)}
            >
              {messages.navCart}
            </Link>
            {isLoggedIn ? (
              <form action={logoutCustomer}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="cursor-pointer py-2.5 font-medium">
                  {messages.navLogout}
                </button>
              </form>
            ) : (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="cursor-pointer py-2.5 font-medium"
                  onClick={() => setOpen(false)}
                >
                  {messages.navLogin}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="mt-2 inline-flex w-fit cursor-pointer border border-mm-primary px-4 py-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  {messages.navRegister}
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
