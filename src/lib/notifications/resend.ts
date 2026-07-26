import {
  buildOrderAdminNewEmail,
  buildOrderApprovedEmail,
  buildOrderCompletedEmail,
  buildOrderReceivedEmail,
  buildOrderRejectedEmail,
  toAdminNewOrderEmailPayload,
  toOrderEmailPayload,
} from "./templates";
import type { OrderEmailPayload, SendEmailResult } from "./types";
import { getMessages } from "@/lib/i18n";
import { loadSiteSettingsMap } from "@/lib/site-cms";
import { resolveBusinessContact } from "@/lib/site-content";
import { getRejectionReasonText } from "@/lib/orders/rejection-reasons";
import { redactEmail } from "@/lib/rate-limit";

type ResendApiResponse = { id?: string; message?: string };

/**
 * When RESEND_DEV_TO is set (no verified domain yet), all mail goes there.
 * Subject/body keep a note of the original intended recipient.
 */
export function resolveEmailDestination(intendedTo: string): {
  to: string;
  subjectPrefix: string;
  htmlNote: string;
} {
  const override = process.env.RESEND_DEV_TO?.trim();
  if (!override || override.toLowerCase() === intendedTo.toLowerCase()) {
    return { to: intendedTo, subjectPrefix: "", htmlNote: "" };
  }
  return {
    to: override,
    subjectPrefix: `[DEV → ${intendedTo}] `,
    htmlNote: `<div style="margin:0 0 16px;padding:12px 16px;background:#f5efe4;border:1px solid #d6d0b3;font-family:Arial,sans-serif;font-size:13px;color:#726b4f;text-align:center"><strong>מצב פיתוח:</strong> מיועד ל־<code dir="ltr">${intendedTo}</code> · נשלח ל־<code dir="ltr">${override}</code></div>`,
  };
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  /** Customer reply address (contact form, etc.). */
  replyTo?: string;
  /** Send to `to` even when RESEND_DEV_TO is set (e.g. shop contact inbox). */
  bypassDevRedirect?: boolean;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    console.warn("[notifications] Resend not configured — email skipped");
    return { ok: false, error: "not_configured", skipped: true };
  }

  const dest = input.bypassDevRedirect
    ? { to: input.to, subjectPrefix: "", htmlNote: "" }
    : resolveEmailDestination(input.to);
  const subject = `${dest.subjectPrefix}${input.subject}`;
  const html = dest.htmlNote ? `${dest.htmlNote}${input.html}` : input.html;

  if (dest.subjectPrefix) {
    console.info(
      `[notifications] RESEND_DEV_TO redirect: ${redactEmail(input.to)} → ${redactEmail(dest.to)}`,
    );
  }

  try {
    const payload: Record<string, unknown> = {
      from,
      to: [dest.to],
      subject,
      html,
    };
    const replyTo = input.replyTo?.trim();
    if (replyTo) {
      payload.reply_to = replyTo;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await res.json()) as ResendApiResponse;
    if (!res.ok) {
      console.error("[notifications] Resend error", body);
      return { ok: false, error: body.message ?? `http_${res.status}` };
    }

    if (!body.id) {
      return { ok: false, error: "missing_message_id" };
    }

    return { ok: true, messageId: body.id };
  } catch (err) {
    console.error("[notifications] Resend request failed", err);
    return { ok: false, error: "network_error" };
  }
}

async function sendOrderEmail(
  payload: OrderEmailPayload,
  kind: "received" | "approved" | "rejected" | "completed",
): Promise<SendEmailResult> {
  const built =
    kind === "received"
      ? buildOrderReceivedEmail(payload)
      : kind === "approved"
        ? buildOrderApprovedEmail(payload)
        : kind === "rejected"
          ? buildOrderRejectedEmail(payload)
          : buildOrderCompletedEmail(payload);

  return sendTransactionalEmail({
    to: payload.customerEmail,
    subject: built.subject,
    html: built.html,
  });
}

export async function sendOrderReceived(
  order: Parameters<typeof toOrderEmailPayload>[0],
): Promise<SendEmailResult> {
  return sendOrderEmail(toOrderEmailPayload(order), "received");
}

export async function sendOrderAdminNew(
  order: Parameters<typeof toAdminNewOrderEmailPayload>[0],
  itemCount: number,
): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) {
    console.warn("[notifications] ADMIN_EMAIL not configured — admin alert skipped");
    return { ok: false, error: "admin_email_not_configured", skipped: true };
  }

  const built = buildOrderAdminNewEmail(
    toAdminNewOrderEmailPayload(order, itemCount),
  );
  return sendTransactionalEmail({
    to: adminEmail,
    subject: built.subject,
    html: built.html,
  });
}

export async function sendOrderApproved(
  order: Parameters<typeof toOrderEmailPayload>[0] & {
    payment_method?: "on_pickup" | "bank_transfer";
  },
): Promise<SendEmailResult> {
  const base = toOrderEmailPayload(order);
  const settings = await loadSiteSettingsMap();
  const messages = getMessages(base.locale);
  const contact = resolveBusinessContact(settings, messages);

  const payload: OrderEmailPayload = {
    ...base,
    paymentMethod: order.payment_method,
    bankTransferDetails: settings.bank_transfer_details ?? null,
    contactPhone: contact.phone,
  };

  return sendOrderEmail(payload, "approved");
}

export async function sendOrderRejected(
  order: Parameters<typeof toOrderEmailPayload>[0] & {
    rejection_reason_code?: string | null;
    rejection_reason_custom?: string | null;
  },
): Promise<SendEmailResult> {
  const payload = toOrderEmailPayload(order);
  payload.rejectionReason = getRejectionReasonText(
    order.rejection_reason_code,
    order.rejection_reason_custom,
    payload.locale,
  );
  return sendOrderEmail(payload, "rejected");
}

export async function sendOrderCompleted(
  order: Parameters<typeof toOrderEmailPayload>[0],
): Promise<SendEmailResult> {
  return sendOrderEmail(toOrderEmailPayload(order), "completed");
}
