import { MarketingConsentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/campaigns/email";

export async function upsertMarketingOptIn(
  email: string,
  source = "checkout",
): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  const now = new Date();
  await prisma.marketingConsent.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      status: MarketingConsentStatus.opted_in,
      source,
      opted_in_at: now,
      opted_out_at: null,
    },
    update: {
      status: MarketingConsentStatus.opted_in,
      source,
      opted_in_at: now,
      opted_out_at: null,
    },
  });
}

export async function revokeMarketingConsent(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const now = new Date();
  const existing = await prisma.marketingConsent.findUnique({
    where: { email: normalized },
  });
  if (!existing) {
    await prisma.marketingConsent.create({
      data: {
        email: normalized,
        status: MarketingConsentStatus.opted_out,
        source: "unsubscribe",
        opted_out_at: now,
      },
    });
    return true;
  }
  await prisma.marketingConsent.update({
    where: { email: normalized },
    data: {
      status: MarketingConsentStatus.opted_out,
      opted_out_at: now,
    },
  });
  return true;
}

/**
 * Distinct Order.customer_email values with active marketing consent.
 */
export async function resolveCampaignAudience(): Promise<string[]> {
  const consents = await prisma.marketingConsent.findMany({
    where: { status: MarketingConsentStatus.opted_in },
    select: { email: true },
  });
  if (!consents.length) return [];

  const consented = new Set(consents.map((c) => c.email));
  const orders = await prisma.order.findMany({
    select: { customer_email: true },
    distinct: ["customer_email"],
  });

  const audience: string[] = [];
  for (const row of orders) {
    const email = normalizeEmail(row.customer_email);
    if (consented.has(email)) {
      audience.push(email);
    }
  }
  return audience.sort();
}

export async function countCampaignAudience(): Promise<number> {
  return (await resolveCampaignAudience()).length;
}
