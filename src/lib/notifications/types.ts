export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; skipped?: boolean };

export type OrderEmailPayload = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  fulfillmentDate: string;
  total: string;
  /** Storefront locale at checkout — drives customer email language. */
  locale: "he" | "en";
};

export type AdminNewOrderEmailPayload = OrderEmailPayload & {
  customerPhone: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress: string | null;
  paymentMethod: "on_pickup" | "bank_transfer";
  customerNotes: string | null;
  itemCount: number;
  /** Absolute URL to admin order detail (approve/reject). */
  adminOrderUrl: string;
};
