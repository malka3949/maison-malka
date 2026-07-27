"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartProvider";
import { computeUnitPrice } from "@/lib/pricing";
import type { Locale, Messages } from "@/lib/i18n";

type OptionValue = {
  id: string;
  labelKey: string;
  priceDelta: number;
  isDefault: boolean;
};

type Option = {
  id: string;
  nameKey: string;
  isRequired: boolean;
  values: OptionValue[];
};

type Props = {
  productId: string;
  productName: string;
  basePrice: number;
  options: Option[];
  messages: Messages;
  locale: Locale;
};

export function AddToCartButton({
  productId,
  productName,
  basePrice,
  options,
  messages,
  locale,
}: Props) {
  const { addLine } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const defaults = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of options) {
      const def = opt.values.find((v) => v.isDefault) ?? opt.values[0];
      if (def) {
        map[opt.id] = def.id;
      }
    }
    return map;
  }, [options]);

  const [selected, setSelected] = useState<Record<string, string>>(defaults);

  const unitPrice = useMemo(() => {
    const deltas = options.map((opt) => {
      const id = selected[opt.id];
      const val = opt.values.find((v) => v.id === id);
      return val ? val.priceDelta : 0;
    });
    return computeUnitPrice(basePrice, deltas);
  }, [basePrice, options, selected]);

  function onAdd() {
    for (const opt of options) {
      if (opt.isRequired && !selected[opt.id]) {
        setError(messages.errorRequiredOptions);
        return;
      }
    }
    setError(null);
    const optionValueIds = options.map((opt) => selected[opt.id]).filter(Boolean);
    const optionLabels = options
      .map((opt) => {
        const val = opt.values.find((v) => v.id === selected[opt.id]);
        if (!val) return null;
        return `${opt.nameKey}: ${val.labelKey}`;
      })
      .filter((x): x is string => Boolean(x));
    addLine({
      productId,
      name: productName,
      unitPrice,
      optionValueIds,
      optionLabels,
      quantity: 1,
    });
    router.push(`/${locale}/cart`);
  }

  return (
    <div className="space-y-5">
      {options.map((opt) => (
        <fieldset key={opt.id} className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-mm-word">
            {opt.nameKey}
            {opt.isRequired ? " *" : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((v) => (
              <label
                key={v.id}
                className={`mm-option-chip ${
                  selected[opt.id] === v.id ? "is-active" : ""
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name={opt.id}
                  checked={selected[opt.id] === v.id}
                  onChange={() =>
                    setSelected((prev) => ({ ...prev, [opt.id]: v.id }))
                  }
                />
                {v.labelKey}
                {v.priceDelta > 0 ? ` (+${messages.ils}${v.priceDelta})` : ""}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <p className="font-heading text-2xl tracking-tight text-mm-primary">
        {messages.ils}
        {unitPrice.toFixed(2)}
      </p>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button type="button" onClick={onAdd} className="mm-btn w-full sm:w-auto">
        {messages.addToCart}
      </button>
    </div>
  );
}
