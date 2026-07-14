"use client";

import Link from "next/link";
import { useCart } from "@/components/storefront/CartProvider";
import { computeLineTotal, sumMoney } from "@/lib/pricing";
import type { Locale, Messages } from "@/lib/i18n";

export function CartView({ locale, messages }: { locale: Locale; messages: Messages }) {
  const { lines, updateQuantity, removeLine } = useCart();
  const subtotal = sumMoney(
    lines.map((l) => computeLineTotal(l.unitPrice, l.quantity)),
  );

  if (lines.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-mm-secondary">{messages.cartEmpty}</p>
        <Link
          href={`/${locale}/catalog`}
          className="inline-block cursor-pointer text-mm-cta hover:text-mm-cta-hover"
        >
          {messages.navCatalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-stone-200 border border-stone-200 bg-white">
        {lines.map((line) => (
          <li
            key={`${line.productId}-${line.optionValueIds.join(",")}`}
            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
          >
            <div>
              <p className="font-medium text-mm-primary">{line.name}</p>
              <p className="text-sm text-mm-accent">
                {messages.ils}
                {line.unitPrice.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-mm-secondary">
                {messages.quantity}
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      line.productId,
                      line.optionValueIds,
                      Number(e.target.value) || 1,
                    )
                  }
                  className="ms-2 w-16 border border-stone-300 px-2 py-1"
                />
              </label>
              <button
                type="button"
                onClick={() => removeLine(line.productId, line.optionValueIds)}
                className="cursor-pointer text-sm text-red-700 hover:underline"
              >
                {messages.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-heading text-xl text-mm-primary">
          {messages.subtotal}: {messages.ils}
          {subtotal.toFixed(2)}
        </p>
        <Link
          href={`/${locale}/checkout`}
          className="cursor-pointer rounded-sm bg-mm-cta px-6 py-3 text-white transition-colors hover:bg-mm-cta-hover"
        >
          {messages.checkout}
        </Link>
      </div>
    </div>
  );
}
