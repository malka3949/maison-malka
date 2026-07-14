export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; skipped?: boolean };

export type OrderEmailPayload = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  fulfillmentDate: string;
  total: string;
};
