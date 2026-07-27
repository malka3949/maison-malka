"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countCampaignAudience } from "@/lib/campaigns/consent";
import { sendMarketingCampaign } from "@/lib/campaigns/send";
import { revokeMarketingConsent } from "@/lib/campaigns/consent";
import { verifyUnsubscribeToken } from "@/lib/campaigns/email";

export type CampaignFormState = {
  error?: string;
  success?: boolean;
  campaignId?: string;
};

export async function sendCampaignAction(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    return { error: "unauthorized" };
  }

  const subject = String(formData.get("subject") || "");
  const body = String(formData.get("body") || "");
  const confirmed = formData.get("confirmSend") === "on";

  if (!confirmed) {
    return { error: "confirm_required" };
  }

  const count = await countCampaignAudience();
  if (count === 0) {
    return { error: "empty_audience" };
  }

  const result = await sendMarketingCampaign({
    subject,
    body,
    createdByUserId: admin.appUser.id,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/campaigns");
  return { success: true, campaignId: result.campaignId };
}

export async function listCampaignsForAdmin() {
  const admin = await requireAdmin();
  if (!admin) return [];
  return prisma.emailCampaign.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
    select: {
      id: true,
      subject: true,
      status: true,
      recipient_count: true,
      sent_at: true,
      created_at: true,
    },
  });
}

export type UnsubscribeResult =
  | { ok: true }
  | { ok: false; error: "invalid_token" | "failed" };

export async function unsubscribeByTokenAction(
  token: string,
): Promise<UnsubscribeResult> {
  const email = verifyUnsubscribeToken(token);
  if (!email) {
    return { ok: false, error: "invalid_token" };
  }
  try {
    await revokeMarketingConsent(email);
    return { ok: true };
  } catch {
    return { ok: false, error: "failed" };
  }
}
