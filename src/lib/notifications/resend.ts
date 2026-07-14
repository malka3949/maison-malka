import {
  buildOrderApprovedEmail,
  buildOrderReceivedEmail,
  buildOrderRejectedEmail,
  toOrderEmailPayload,
} from "./templates";
import type { OrderEmailPayload, SendEmailResult } from "./types";

type ResendApiResponse = { id?: string; message?: string };

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    console.warn("[notifications] Resend not configured — email skipped");
    return { ok: false, error: "not_configured", skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
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
  kind: "received" | "approved" | "rejected",
): Promise<SendEmailResult> {
  const built =
    kind === "received"
      ? buildOrderReceivedEmail(payload)
      : kind === "approved"
        ? buildOrderApprovedEmail(payload)
        : buildOrderRejectedEmail(payload);

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

export async function sendOrderApproved(
  order: Parameters<typeof toOrderEmailPayload>[0],
): Promise<SendEmailResult> {
  return sendOrderEmail(toOrderEmailPayload(order), "approved");
}

export async function sendOrderRejected(
  order: Parameters<typeof toOrderEmailPayload>[0],
): Promise<SendEmailResult> {
  return sendOrderEmail(toOrderEmailPayload(order), "rejected");
}
