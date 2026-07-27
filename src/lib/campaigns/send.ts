import {
  CampaignSendStatus,
  EmailCampaignStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveCampaignAudience } from "@/lib/campaigns/consent";
import { buildCampaignEmail } from "@/lib/campaigns/templates";
import { sendTransactionalEmail } from "@/lib/notifications/resend";
import { redactEmail } from "@/lib/rate-limit";

/** Max recipients processed between small yields (Resend free-tier friendly). */
export const CAMPAIGN_BATCH_SIZE = 10;

export type SendCampaignResult =
  | { ok: true; campaignId: string; sent: number; failed: number }
  | { ok: false; error: string };

/**
 * Create campaign + CampaignSend rows, then batch-send via Resend.
 * Does not call sendOrder* helpers — only sendTransactionalEmail.
 */
export async function sendMarketingCampaign(input: {
  subject: string;
  body: string;
  createdByUserId?: string | null;
}): Promise<SendCampaignResult> {
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!subject || !body) {
    return { ok: false, error: "missing_fields" };
  }

  const audience = await resolveCampaignAudience();
  if (!audience.length) {
    return { ok: false, error: "empty_audience" };
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject,
      body,
      created_by_user_id: input.createdByUserId ?? null,
      status: EmailCampaignStatus.sending,
      recipient_count: audience.length,
      sends: {
        create: audience.map((email) => ({
          email,
          status: CampaignSendStatus.pending,
        })),
      },
    },
    include: { sends: true },
  });

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < campaign.sends.length; i++) {
    const row = campaign.sends[i];
    const built = buildCampaignEmail({
      subject,
      body,
      recipientEmail: row.email,
      locale: "he",
    });

    if (!built) {
      failed += 1;
      await prisma.campaignSend.update({
        where: { id: row.id },
        data: {
          status: CampaignSendStatus.failed,
          error_note: "unsubscribe_token_unavailable",
        },
      });
      continue;
    }

    const result = await sendTransactionalEmail({
      to: row.email,
      subject: built.subject,
      html: built.html,
    });

    if (result.ok) {
      sent += 1;
      await prisma.campaignSend.update({
        where: { id: row.id },
        data: { status: CampaignSendStatus.sent, error_note: null },
      });
    } else if (result.skipped) {
      failed += 1;
      await prisma.campaignSend.update({
        where: { id: row.id },
        data: {
          status: CampaignSendStatus.skipped,
          error_note: result.error ?? "skipped",
        },
      });
    } else {
      failed += 1;
      await prisma.campaignSend.update({
        where: { id: row.id },
        data: {
          status: CampaignSendStatus.failed,
          error_note: result.error ?? "send_failed",
        },
      });
      console.error(
        "[campaigns] send failed",
        redactEmail(row.email),
        result.error,
      );
    }

    // Soft yield every batch for free-tier politeness
    if ((i + 1) % CAMPAIGN_BATCH_SIZE === 0) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  let status: EmailCampaignStatus = EmailCampaignStatus.sent;
  if (sent === 0) {
    status = EmailCampaignStatus.failed;
  } else if (failed > 0) {
    status = EmailCampaignStatus.partial;
  }

  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: {
      status,
      sent_at: new Date(),
    },
  });

  return { ok: true, campaignId: campaign.id, sent, failed };
}
