import type { AdminNewOrderEmailPayload, OrderEmailPayload } from "./types";

/** Maison Malka brand tokens for transactional email (inline-safe). */
const C = {
  bg: "#efece8",
  surface: "#fffcf8",
  soft: "#e8e3da",
  line: "#d6d0b3",
  gold: "#a2947a",
  goldDark: "#8c7f66",
  word: "#726b4f",
  text: "#1a1814",
  muted: "#6f6a60",
  white: "#ffffff",
  success: "#5c7a5c",
  successBg: "#eef4ee",
  pending: "#8a7348",
  pendingBg: "#f5efe4",
  reject: "#8a5a5a",
  rejectBg: "#f6eeee",
  admin: "#4a5568",
  adminBg: "#eef1f5",
} as const;

type StatusTone = "pending" | "success" | "reject" | "admin";

function toneColors(tone: StatusTone) {
  switch (tone) {
    case "success":
      return { fg: C.success, bg: C.successBg };
    case "reject":
      return { fg: C.reject, bg: C.rejectBg };
    case "admin":
      return { fg: C.admin, bg: C.adminBg };
    default:
      return { fg: C.pending, bg: C.pendingBg };
  }
}

function detailRow(label: string, value: string, last = false): string {
  const border = last ? "none" : `1px solid ${C.line}`;
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:${border};font-size:13px;color:${C.muted};width:42%;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">
        ${label}
      </td>
      <td style="padding:12px 0;border-bottom:${border};font-size:14px;color:${C.text};font-weight:600;text-align:left;vertical-align:top;font-family:Arial,Helvetica,sans-serif;" dir="auto">
        ${value}
      </td>
    </tr>`;
}

function wrapEmail(options: {
  preheader: string;
  eyebrow: string;
  title: string;
  introHtml: string;
  bodyHtml: string;
  tone: StatusTone;
  badge: string;
  ctaHtml?: string;
  locale?: "he" | "en";
}): string {
  const t = toneColors(options.tone);
  const locale = options.locale ?? "he";
  const dir = locale === "en" ? "ltr" : "rtl";
  const footerLine =
    locale === "en"
      ? "From our kitchen in Jerusalem"
      : "מהמטבח שלנו בירושלים";
  const footerSub =
    locale === "en"
      ? "Maison Malka · Boutique pastry atelier in Jerusalem"
      : "Maison Malka · קונדיטוריה בוטיק בירושלים";
  const footerNote =
    locale === "en"
      ? "This message was sent automatically — no reply needed"
      : "הודעה זו נשלחה אוטומטית — אין צורך להשיב";
  const ctaBlock = options.ctaHtml
    ? `
          <tr>
            <td align="center" style="padding:8px 28px 4px;">
              ${options.ctaHtml}
            </td>
          </tr>`
    : "";
  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Maison Malka</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${C.surface};border:1px solid ${C.line};">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${C.goldDark},${C.gold},${C.goldDark});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td align="center" style="padding:36px 28px 20px;background:${C.surface};">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.1;color:${C.text};letter-spacing:0.04em;font-weight:400;">
                Maison Malka
              </p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${C.word};">
                Boutique pastry atelier · Jerusalem
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 0;">
                <tr>
                  <td style="width:36px;height:1px;background:${C.line};font-size:0;">&nbsp;</td>
                  <td style="padding:0 10px;font-size:14px;color:${C.gold};font-family:Georgia,serif;">✦</td>
                  <td style="width:36px;height:1px;background:${C.line};font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 28px 8px;">
              <span style="display:inline-block;padding:8px 18px;background:${t.bg};color:${t.fg};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;border:1px solid ${C.line};">
                ${escapeHtml(options.badge)}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 8px;text-align:center;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${C.gold};">
                ${escapeHtml(options.eyebrow)}
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:500;color:${C.text};">
                ${escapeHtml(options.title)}
              </h1>
              <div style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${C.muted};text-align:center;">
                ${options.introHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.soft};border:1px solid ${C.line};">
                <tr>
                  <td style="padding:18px 20px;">
                    ${options.bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td align="center" style="padding:28px 28px 36px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:${C.word};">
                ${footerLine}
              </p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${C.muted};">
                ${footerSub}
              </p>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${C.line};">
                ${footerNote}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function ctaButton(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:12px auto 0;">
      <tr>
        <td align="center" style="border-radius:0;background:${C.gold};">
          <a href="${safeHref}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.04em;color:${C.white};text-decoration:none;background:${C.gold};border:1px solid ${C.goldDark};">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${C.muted};text-align:center;">
      אחרי האישור יישלח ללקוח מייל שההזמנה אושרה
    </p>`;
}

/** Public site origin for absolute links in emails. */
export function getAppBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

function detailsTable(rows: [string, string][]): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${rows
        .map(([label, value], i) =>
          detailRow(label, value, i === rows.length - 1),
        )
        .join("")}
    </table>`;
}

export function buildOrderReceivedEmail(payload: OrderEmailPayload) {
  const shortId = payload.orderId.slice(-8);
  const en = payload.locale === "en";
  const name = escapeHtml(payload.customerName);
  return {
    subject: en
      ? `Maison Malka — Order received (${shortId})`
      : `Maison Malka — ההזמנה התקבלה (${shortId})`,
    html: wrapEmail({
      locale: payload.locale,
      preheader: en
        ? `We received your order · ₪${payload.total}`
        : `קיבלנו את ההזמנה שלך · ₪${payload.total}`,
      eyebrow: en ? "Order confirmation" : "אישור קבלה",
      title: en ? "Order received" : "ההזמנה התקבלה",
      badge: en ? "Pending approval" : "ממתינה לאישור",
      tone: "pending",
      introHtml: en
        ? `<p style="margin:0;">Hello <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">We received your order request. It is now awaiting shop approval — we will update you as soon as there is news.</p>`
        : `<p style="margin:0;">שלום <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">קיבלנו את בקשת ההזמנה שלך. היא ממתינה כעת לאישור העסק — ונעדכן אותך מיד כשיהיה עדכון.</p>`,
      bodyHtml: detailsTable(
        en
          ? [
              ["Order number", escapeHtml(payload.orderId)],
              ["Requested date", escapeHtml(payload.fulfillmentDate)],
              ["Total", `₪${escapeHtml(payload.total)}`],
            ]
          : [
              ["מספר הזמנה", escapeHtml(payload.orderId)],
              ["תאריך מילוי מבוקש", escapeHtml(payload.fulfillmentDate)],
              ["סכום", `₪${escapeHtml(payload.total)}`],
            ],
      ),
    }),
  };
}

export function buildOrderApprovedEmail(payload: OrderEmailPayload) {
  const shortId = payload.orderId.slice(-8);
  const en = payload.locale === "en";
  const name = escapeHtml(payload.customerName);

  const rows: [string, string][] = en
    ? [
        ["Order number", escapeHtml(payload.orderId)],
        ["Fulfillment date", escapeHtml(payload.fulfillmentDate)],
        ["Total", `₪${escapeHtml(payload.total)}`],
      ]
    : [
        ["מספר הזמנה", escapeHtml(payload.orderId)],
        ["תאריך מילוי", escapeHtml(payload.fulfillmentDate)],
        ["סכום", `₪${escapeHtml(payload.total)}`],
      ];

  let bankHtml = "";
  if (payload.paymentMethod === "bank_transfer") {
    const details = payload.bankTransferDetails?.trim();
    const phone = payload.contactPhone?.trim();
    if (details) {
      bankHtml = en
        ? `<div style="margin:16px 0 0;padding:14px 16px;background:#f7f3ea;border:1px solid #e2d9c4;border-radius:8px;font-size:14px;line-height:1.5;color:${C.text};white-space:pre-wrap;">
            <strong>Bank transfer instructions</strong><br/>${escapeHtml(details)}
           </div>`
        : `<div style="margin:16px 0 0;padding:14px 16px;background:#f7f3ea;border:1px solid #e2d9c4;border-radius:8px;font-size:14px;line-height:1.5;color:${C.text};white-space:pre-wrap;">
            <strong>הוראות להעברה בנקאית</strong><br/>${escapeHtml(details)}
           </div>`;
    } else {
      const phoneNote = phone
        ? en
          ? `Please contact the shop at ${escapeHtml(phone)} for payment details.`
          : `נא ליצור קשר עם בית העסק בטלפון ${escapeHtml(phone)} לקבלת פרטי תשלום.`
        : en
          ? "Please contact the shop for payment details."
          : "נא ליצור קשר עם בית העסק לקבלת פרטי תשלום.";
      bankHtml = `<p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:${C.text};">${phoneNote}</p>`;
    }
  }

  return {
    subject: en
      ? `Maison Malka — Order approved (${shortId})`
      : `Maison Malka — ההזמנה אושרה (${shortId})`,
    html: wrapEmail({
      locale: payload.locale,
      preheader: en
        ? `Your order is approved · ${payload.fulfillmentDate}`
        : `ההזמנה אושרה · תאריך מילוי ${payload.fulfillmentDate}`,
      eyebrow: en ? "Good news" : "בשורה טובה",
      title: en ? "Order approved" : "ההזמנה אושרה",
      badge: en ? "Approved" : "מאושרת",
      tone: "success",
      introHtml: en
        ? `<p style="margin:0;">Hello <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">Great news — your order has been approved. We look forward to preparing it for you on time.</p>`
        : `<p style="margin:0;">שלום <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">שמחים לבשר — ההזמנה שלך אושרה. נשמח להכין עבורך ולעמוד בלוח הזמנים.</p>`,
      bodyHtml: `${detailsTable(rows)}${bankHtml}`,
    }),
  };
}

export function buildOrderRejectedEmail(payload: OrderEmailPayload) {
  const shortId = payload.orderId.slice(-8);
  const en = payload.locale === "en";
  const name = escapeHtml(payload.customerName);
  return {
    subject: en
      ? `Maison Malka — Order not approved (${shortId})`
      : `Maison Malka — ההזמנה לא אושרה (${shortId})`,
    html: wrapEmail({
      locale: payload.locale,
      preheader: en
        ? "An update about your order request"
        : "עדכון לגבי בקשת ההזמנה שלך",
      eyebrow: en ? "Order update" : "עדכון הזמנה",
      title: en ? "Unable to approve for now" : "לא ניתן לאשר כרגע",
      badge: en ? "Not approved" : "לא אושרה",
      tone: "reject",
      introHtml: en
        ? `<p style="margin:0;">Hello <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">Unfortunately we cannot approve this order at this time. Please contact the shop if you have questions.</p>`
        : `<p style="margin:0;">שלום <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">לצערנו לא ניתן לאשר את ההזמנה בשלב זה. נשמח לעזור בבירור — אפשר ליצור איתנו קשר.</p>`,
      bodyHtml: detailsTable(
        en
          ? [["Order number", escapeHtml(payload.orderId)]]
          : [["מספר הזמנה", escapeHtml(payload.orderId)]],
      ),
    }),
  };
}

export function buildOrderCompletedEmail(payload: OrderEmailPayload) {
  const shortId = payload.orderId.slice(-8);
  const en = payload.locale === "en";
  const name = escapeHtml(payload.customerName);
  return {
    subject: en
      ? `Maison Malka — Order completed (${shortId})`
      : `Maison Malka — ההזמנה הושלמה (${shortId})`,
    html: wrapEmail({
      locale: payload.locale,
      preheader: en
        ? `Your order is complete · ${payload.fulfillmentDate}`
        : `ההזמנה הושלמה · תאריך מילוי ${payload.fulfillmentDate}`,
      eyebrow: en ? "Thank you" : "תודה",
      title: en ? "Order completed" : "ההזמנה הושלמה",
      badge: en ? "Completed" : "הושלם",
      tone: "success",
      introHtml: en
        ? `<p style="margin:0;">Hello <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">Your order has been marked complete. We hope you enjoy every bite.</p>`
        : `<p style="margin:0;">שלום <strong style="color:${C.text};">${name}</strong>,</p>
           <p style="margin:10px 0 0;">ההזמנה סומנה כהושלמה. מקווים שתהנו מכל ביס.</p>`,
      bodyHtml: detailsTable(
        en
          ? [
              ["Order number", escapeHtml(payload.orderId)],
              ["Fulfillment date", escapeHtml(payload.fulfillmentDate)],
              ["Total", `₪${escapeHtml(payload.total)}`],
            ]
          : [
              ["מספר הזמנה", escapeHtml(payload.orderId)],
              ["תאריך מילוי", escapeHtml(payload.fulfillmentDate)],
              ["סכום", `₪${escapeHtml(payload.total)}`],
            ],
      ),
    }),
  };
}

export function buildOrderAdminNewEmail(payload: AdminNewOrderEmailPayload) {
  const fulfillmentLabel =
    payload.fulfillmentType === "delivery" ? "משלוח" : "איסוף עצמי";
  const paymentLabel =
    payload.paymentMethod === "bank_transfer"
      ? "העברה בנקאית"
      : "תשלום באיסוף";

  const rows: [string, string][] = [
    ["מספר הזמנה", escapeHtml(payload.orderId)],
    ["לקוח", escapeHtml(payload.customerName)],
    ["טלפון", escapeHtml(payload.customerPhone)],
    ["אימייל", escapeHtml(payload.customerEmail)],
    ["סוג מילוי", fulfillmentLabel],
  ];
  if (payload.deliveryAddress) {
    rows.push(["כתובת משלוח", escapeHtml(payload.deliveryAddress)]);
  }
  rows.push(
    ["תאריך מילוי", escapeHtml(payload.fulfillmentDate)],
    ["תשלום", paymentLabel],
    ["פריטים", String(payload.itemCount)],
    ["סכום", `₪${escapeHtml(payload.total)}`],
  );
  if (payload.customerNotes) {
    rows.push(["הערות לקוח", escapeHtml(payload.customerNotes)]);
  }

  return {
    subject: `הזמנה חדשה — ${payload.customerName} (${payload.orderId.slice(-8)})`,
    html: wrapEmail({
      locale: "he",
      preheader: `הזמנה חדשה מ-${payload.customerName} · ₪${payload.total}`,
      eyebrow: "התראת אדמין",
      title: "הזמנה חדשה באתר",
      badge: "דורש טיפול",
      tone: "admin",
      introHtml: `<p style="margin:0;">התקבלה הזמנה חדשה ב-Maison Malka וממתינה לאישור בפאנל הניהול.</p>
        <p style="margin:10px 0 0;font-size:13px;">שפת האתר של הלקוח: <strong>${payload.locale === "en" ? "English" : "עברית"}</strong></p>`,
      bodyHtml: detailsTable(rows),
      ctaHtml: ctaButton(payload.adminOrderUrl, "לאישור ההזמנה באתר"),
    }),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatFulfillmentDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function normalizeEmailLocale(
  value: string | null | undefined,
): "he" | "en" {
  return value === "en" ? "en" : "he";
}

export function toOrderEmailPayload(order: {
  id: string;
  customer_name: string;
  customer_email: string;
  requested_fulfillment_date: Date;
  total: { toString(): string } | number | string;
  locale?: string | null;
}): OrderEmailPayload {
  return {
    orderId: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    fulfillmentDate: formatFulfillmentDate(order.requested_fulfillment_date),
    total: String(order.total),
    locale: normalizeEmailLocale(order.locale),
  };
}

export function toAdminNewOrderEmailPayload(
  order: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    fulfillment_type: "pickup" | "delivery";
    delivery_address: string | null;
    payment_method: "on_pickup" | "bank_transfer";
    customer_notes: string | null;
    requested_fulfillment_date: Date;
    total: { toString(): string } | number | string;
    locale?: string | null;
  },
  itemCount: number,
): AdminNewOrderEmailPayload {
  const base = toOrderEmailPayload(order);
  return {
    ...base,
    customerPhone: order.customer_phone,
    fulfillmentType: order.fulfillment_type,
    deliveryAddress: order.delivery_address,
    paymentMethod: order.payment_method,
    customerNotes: order.customer_notes,
    itemCount,
    adminOrderUrl: `${getAppBaseUrl()}/admin/orders/${order.id}`,
  };
}
