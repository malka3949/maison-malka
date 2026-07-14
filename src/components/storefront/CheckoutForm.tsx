"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartProvider";
import { createGuestOrder } from "@/lib/actions/orders";
import { minFulfillmentDate, toDateInputValue } from "@/lib/fulfillment";
import type { Locale, Messages } from "@/lib/i18n";

type Prefill = {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
} | null;

export function CheckoutForm({
  locale,
  messages,
  prefill,
}: {
  locale: Locale;
  messages: Messages;
  prefill: Prefill;
}) {
  const { lines, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const minDate = toDateInputValue(minFulfillmentDate());

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError(messages.errorEmptyCart);
      return;
    }

    const form = new FormData(e.currentTarget);
    setPending(true);
    const result = await createGuestOrder({
      customerName: String(form.get("fullName") || ""),
      customerPhone: String(form.get("phone") || ""),
      customerEmail: String(form.get("email") || ""),
      fulfillmentType: fulfillment,
      deliveryAddress: String(form.get("deliveryAddress") || ""),
      requestedFulfillmentDate: String(form.get("fulfillmentDate") || ""),
      paymentMethod: String(form.get("paymentMethod") || "on_pickup") as
        | "bank_transfer"
        | "on_pickup",
      customerNotes: String(form.get("notes") || ""),
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        optionValueIds: l.optionValueIds,
      })),
      locale,
    });
    setPending(false);

    if (!result.ok) {
      const map: Record<string, string> = {
        empty_cart: messages.errorEmptyCart,
        lead_time: messages.errorLeadTime,
        saturday: messages.errorSaturday,
        delivery_address: messages.errorDeliveryAddress,
        required_options: messages.errorRequiredOptions,
        generic: messages.errorGeneric,
      };
      setError(map[result.error] ?? messages.errorGeneric);
      return;
    }

    clear();
    router.push(`/${locale}/order/${result.orderId}`);
  }

  if (lines.length === 0) {
    return <p className="text-mm-secondary">{messages.errorEmptyCart}</p>;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-mm-line bg-mm-surface p-6 md:p-8"
    >
      <label className="block space-y-1 text-sm text-mm-secondary">
        <span>{messages.fullName}</span>
        <input
          name="fullName"
          required
          defaultValue={prefill?.fullName ?? ""}
          className="mm-field"
        />
      </label>
      <label className="block space-y-1 text-sm text-mm-secondary">
        <span>{messages.phone}</span>
        <input
          name="phone"
          required
          defaultValue={prefill?.phone ?? ""}
          className="mm-field"
        />
      </label>
      <label className="block space-y-1 text-sm text-mm-secondary">
        <span>{messages.email}</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={prefill?.email ?? ""}
          className="mm-field"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-mm-primary">{messages.fulfillment}</legend>
        <label className="me-4 inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="fulfillmentType"
            checked={fulfillment === "pickup"}
            onChange={() => setFulfillment("pickup")}
          />
          {messages.pickup}
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="fulfillmentType"
            checked={fulfillment === "delivery"}
            onChange={() => setFulfillment("delivery")}
          />
          {messages.delivery}
        </label>
      </fieldset>

      {fulfillment === "delivery" ? (
        <label className="block space-y-1 text-sm text-mm-secondary">
          <span>{messages.deliveryAddress}</span>
          <textarea
            name="deliveryAddress"
            required
            defaultValue={prefill?.deliveryAddress ?? ""}
            className="mm-field"
            rows={2}
          />
        </label>
      ) : null}

      <label className="block space-y-1 text-sm text-mm-secondary">
        <span>{messages.fulfillmentDate}</span>
        <input
          name="fulfillmentDate"
          type="date"
          required
          min={minDate}
          defaultValue={minDate}
          className="mm-field"
        />
      </label>

      <label className="block space-y-1 text-sm text-mm-secondary">
        <span>{messages.paymentMethod}</span>
        <select name="paymentMethod" className="mm-field" defaultValue="on_pickup">
          <option value="on_pickup">{messages.onPickup}</option>
          <option value="bank_transfer">{messages.bankTransfer}</option>
        </select>
      </label>

      <label className="block space-y-1 text-sm text-mm-secondary">
        <span>{messages.notes}</span>
        <textarea name="notes" className="mm-field" rows={2} />
      </label>

      <p className="rounded-xl border border-mm-line bg-mm-soft p-3 text-xs leading-relaxed text-mm-secondary">
        {messages.privacyNotice}
      </p>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button type="submit" disabled={pending} className="mm-btn w-full disabled:opacity-60">
        {messages.submitOrder}
      </button>
    </form>
  );
}
