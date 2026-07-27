import { createUnsubscribeToken } from "@/lib/campaigns/email";
import { getAppBaseUrl } from "@/lib/notifications/templates";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bodyToHtml(body: string): string {
  return escapeHtml(body)
    .split(/\r?\n/)
    .map((line) =>
      line.trim()
        ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#1a1814;font-family:Arial,Helvetica,sans-serif;">${line}</p>`
        : `<p style="margin:0 0 12px;">&nbsp;</p>`,
    )
    .join("");
}

export function buildCampaignEmail(input: {
  subject: string;
  body: string;
  recipientEmail: string;
  locale?: "he" | "en";
}): { subject: string; html: string } | null {
  const token = createUnsubscribeToken(input.recipientEmail);
  if (!token) return null;

  const locale = input.locale ?? "he";
  const dir = locale === "en" ? "ltr" : "rtl";
  const base = getAppBaseUrl();
  const unsubUrl = `${base}/${locale}/unsubscribe?token=${encodeURIComponent(token)}`;
  const unsubLabel =
    locale === "en" ? "Unsubscribe from marketing emails" : "הסרה מרשימת דיוור";
  const footerNote =
    locale === "en"
      ? "You received this because you opted in to Maison Malka updates."
      : "קיבלת הודעה זו כי הסכמת לקבל עדכונים מ-Maison Malka.";

  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#efece8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece8;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#fffcf8;border:1px solid #d6d0b3;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:20px 24px;background:#e8e3da;border-bottom:1px solid #d6d0b3;">
          <div style="font-family:Georgia,serif;font-size:22px;color:#726b4f;">Maison Malka</div>
        </td></tr>
        <tr><td style="padding:24px;">
          ${bodyToHtml(input.body)}
        </td></tr>
        <tr><td style="padding:16px 24px 24px;border-top:1px solid #d6d0b3;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6f6a60;text-align:center;">
          <p style="margin:0 0 8px;">${footerNote}</p>
          <p style="margin:0;"><a href="${unsubUrl}" style="color:#8c7f66;">${unsubLabel}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return {
    subject: input.subject.trim(),
    html,
  };
}

/** Pure helper for tests — escape only. */
export function escapeCampaignBodyForTest(body: string): string {
  return escapeHtml(body);
}
