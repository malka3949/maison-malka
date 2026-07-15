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
      <div className="space-y-4 rounded-2xl border border-mm-line bg-mm-surface p-6">
        <p className="text-mm-secondary">{messages.cartEmpty}</p>
        <Link href={`/${locale}/catalog`} className="mm-btn inline-flex">
          {messages.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${locale}/catalog`}
          className="cursor-pointer text-sm font-medium text-mm-secondary underline-offset-4 transition-colors hover:text-mm-primary hover:underline"
        >
          ← {messages.continueShopping}
        </Link>
      </div>

      <ul className="divide-y divide-mm-line overflow-hidden rounded-2xl border border-mm-line bg-mm-surface">
        {lines.map((line) => (
          <li
            key={`${line.productId}-${line.optionValueIds.join(",")}`}
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div>
              <p className="font-medium text-mm-primary">{line.name}</p>
              <p className="text-sm text-mm-cta">
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
                  className="mm-field ms-2 w-16"
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

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-mm-line bg-mm-surface p-5">
        <p className="font-heading text-xl text-mm-primary">
          {messages.subtotal}: {messages.ils}
          {subtotal.toFixed(2)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/catalog`} className="mm-btn mm-btn-outline-dark">
            {messages.continueShopping}
          </Link>
          <Link href={`/${locale}/checkout`} className="mm-btn">
            {messages.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}
