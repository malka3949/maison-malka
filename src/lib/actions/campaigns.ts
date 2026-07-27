"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countCampaignAudience } from "@/lib/campaigns/consent";
import { sendMarketingCampaign } from "@/lib/campaigns/send";
import { revokeMarketingConsent } from "@/lib/campaigns/consent";
import { verifyUnsubscribeToken } from "@/lib/campaigns/email";
import {
  uploadCampaignImage,
  uploadCampaignPdf,
} from "@/lib/campaigns/upload";

export type CampaignFormState = {
  error?: string;
  success?: boolean;
  campaignId?: string;
};

function fileFromForm(formData: FormData, key: string): File | null {
  const raw = formData.get(key);
  if (!(raw instanceof File) || raw.size === 0) return null;
  return raw;
}

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

  const campaignKey = randomBytes(8).toString("hex");
  const imageFile = fileFromForm(formData, "image");
  const pdfFile = fileFromForm(formData, "pdf");

  let imageStoragePath: string | null = null;
  let pdfStoragePath: string | null = null;
  let pdfFilename: string | null = null;
  let pdfBuffer: Buffer | null = null;

  if (imageFile) {
    const up = await uploadCampaignImage(imageFile, campaignKey);
    if (!up.ok) return { error: up.error };
    imageStoragePath = up.storagePath;
  }

  if (pdfFile) {
    const up = await uploadCampaignPdf(pdfFile, campaignKey);
    if (!up.ok) return { error: up.error };
    pdfStoragePath = up.storagePath;
    pdfFilename = up.filename;
    pdfBuffer = up.buffer;
  }

  const result = await sendMarketingCampaign({
    subject,
    body,
    createdByUserId: admin.appUser.id,
    media: {
      imageStoragePath,
      pdfStoragePath,
      pdfFilename,
      pdfBuffer,
    },
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
      image_storage_path: true,
      pdf_storage_path: true,
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
