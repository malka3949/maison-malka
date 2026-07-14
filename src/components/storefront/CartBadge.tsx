"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";
import type { Locale } from "@/lib/i18n";

export function CartBadge({ locale, label }: { locale: Locale; label: string }) {
  const { itemCount } = useCart();
  return (
    <Link
      href={`/${locale}/cart`}
      className="cursor-pointer transition-colors hover:text-mm-primary"
    >
      {label}
      {itemCount > 0 ? (
        <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mm-dark px-1.5 text-xs text-white">
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
