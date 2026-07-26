"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  label: string;
  iconOnly?: boolean;
};

export function CartBadge({ locale, label, iconOnly = false }: Props) {
  const { itemCount } = useCart();
  const ariaLabel =
    itemCount > 0 ? `${label} (${itemCount})` : label;

  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={ariaLabel}
      className="relative inline-flex cursor-pointer items-center gap-1.5 text-sm text-mm-primary transition-opacity hover:opacity-70"
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-[1.35rem] w-[1.35rem]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 7h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 7Z" />
          <path d="M8 7a4 4 0 0 1 8 0" />
        </svg>
        {itemCount > 0 ? (
          <span className="absolute -bottom-0.5 -end-0.5 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-mm-announce px-1 text-[0.62rem] font-semibold leading-none text-mm-primary">
            {itemCount}
          </span>
        ) : null}
      </span>
      {!iconOnly ? <span className="hidden sm:inline">{label}</span> : null}
    </Link>
  );
}
