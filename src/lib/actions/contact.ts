"use server";

import { headers } from "next/headers";
import { sendTransactionalEmail } from "@/lib/notifications/resend";
import {
  clientIpFromHeaders,
  rateLimitConsume,
} from "@/lib/rate-limit";
import { loadSiteSettingsMap } from "@/lib/site-cms";
import { resolveBusinessContact } from "@/lib/site-content";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

export type ContactMessageResult =
  | { ok: true }
  | {
      ok: false;
      error: "rate_limited" | "validation" | "send_failed" | "not_configured" | "generic";
    };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactMessageAction(input: {
  locale: string;
  name: string;
  replyEmail: string;
  message: string;
}): Promise<ContactMessageResult> {
  const locale: Locale = isLocale(input.locale) ? input.locale : "he";
  const name = input.name.trim().slice(0, 120);
  const replyEmail = input.replyEmail.trim().toLowerCase().slice(0, 200);
  const message = input.message.trim().slice(0, 4000);

  if (!name || !message || !isValidEmail(replyEmail)) {
    return { ok: false, error: "validation" };
  }

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const limited = rateLimitConsume(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return { ok: false, error: "rate_limited" };
  }

  const messages = getMessages(locale);
  const settings = await loadSiteSettingsMap();
  const contact = resolveBusinessContact(settings, messages);
  const to = contact.email || process.env.ADMIN_EMAIL?.trim();
  if (!to) {
    return { ok: false, error: "send_failed" };
  }

  const subject =
    locale === "en"
      ? `Contact form — ${name}`
      : `פנייה מהאתר — ${name}`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1a1814">
      <p><strong>${locale === "en" ? "Name" : "שם"}:</strong> ${escapeHtml(name)}</p>
      <p><strong>${locale === "en" ? "Reply to" : "מייל לחזרה"}:</strong>
        <a href="mailto:${escapeHtml(replyEmail)}" dir="ltr">${escapeHtml(replyEmail)}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e2d9c4;margin:16px 0" />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>
  `;

  const result = await sendTransactionalEmail({
    to,
    subject,
    html,
    replyTo: replyEmail,
    // Prefer the shop inbox; do not silently divert to RESEND_DEV_TO.
    bypassDevRedirect: true,
  });

  if (!result.ok) {
    const devTo = process.env.RESEND_DEV_TO?.trim();
    // Resend free/onboarding often only delivers to the account inbox.
    if (devTo && devTo.toLowerCase() !== to.toLowerCase()) {
      const fallback = await sendTransactionalEmail({
        to: devTo,
        subject: `[Contact → ${to}] ${subject}`,
        html: `${html}<p style="margin-top:16px;font-size:12px;color:#726b4f">מיועד במקור ל־<code dir="ltr">${escapeHtml(to)}</code></p>`,
        replyTo: replyEmail,
        bypassDevRedirect: true,
      });
      if (fallback.ok) {
        console.warn(
          `[contact] delivered to RESEND_DEV_TO instead of shop inbox`,
        );
        return { ok: true };
      }
    }
    if (result.skipped || result.error === "not_configured") {
      return { ok: false, error: "not_configured" };
    }
    console.error("[contact] send failed", result.error);
    return { ok: false, error: "send_failed" };
  }
  return { ok: true };
}
