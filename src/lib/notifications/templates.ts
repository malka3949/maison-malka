import type { OrderEmailPayload } from "./types";

export function buildOrderReceivedEmail(payload: OrderEmailPayload) {
  return {
    subject: `Maison Malka — ההזמנה התקבלה (${payload.orderId.slice(-8)})`,
    html: `
      <p>שלום ${escapeHtml(payload.customerName)},</p>
      <p>קיבלנו את בקשת ההזמנה שלך.</p>
      <p><strong>מספר הזמנה:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>תאריך מילוי מבוקש:</strong> ${escapeHtml(payload.fulfillmentDate)}</p>
      <p><strong>סכום:</strong> ₪${escapeHtml(payload.total)}</p>
      <p>ההזמנה ממתינה לאישור העסק. נעדכן אותך לאחר האישור.</p>
      <p>Maison Malka</p>
    `.trim(),
  };
}

export function buildOrderApprovedEmail(payload: OrderEmailPayload) {
  return {
    subject: `Maison Malka — ההזמנה אושרה (${payload.orderId.slice(-8)})`,
    html: `
      <p>שלום ${escapeHtml(payload.customerName)},</p>
      <p>ההזמנה שלך אושרה.</p>
      <p><strong>מספר הזמנה:</strong> ${escapeHtml(payload.orderId)}</p>
      <p><strong>תאריך מילוי:</strong> ${escapeHtml(payload.fulfillmentDate)}</p>
      <p><strong>סכום:</strong> ₪${escapeHtml(payload.total)}</p>
      <p>נשמח לראותך!</p>
      <p>Maison Malka</p>
    `.trim(),
  };
}

export function buildOrderRejectedEmail(payload: OrderEmailPayload) {
  return {
    subject: `Maison Malka — ההזמנה לא אושרה (${payload.orderId.slice(-8)})`,
    html: `
      <p>שלום ${escapeHtml(payload.customerName)},</p>
      <p>לצערנו לא ניתן לאשר את ההזמנה בשלב זה.</p>
      <p><strong>מספר הזמנה:</strong> ${escapeHtml(payload.orderId)}</p>
      <p>לשאלות ניתן ליצור קשר עם העסק.</p>
      <p>Maison Malka</p>
    `.trim(),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function toOrderEmailPayload(order: {
  id: string;
  customer_name: string;
  customer_email: string;
  requested_fulfillment_date: Date;
  total: { toString(): string } | number | string;
}): OrderEmailPayload {
  const d = order.requested_fulfillment_date;
  const fulfillmentDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return {
    orderId: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    fulfillmentDate,
    total: String(order.total),
  };
}
