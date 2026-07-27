-- CreateEnum
CREATE TYPE "MarketingConsentStatus" AS ENUM ('opted_in', 'opted_out');

-- CreateEnum
CREATE TYPE "EmailCampaignStatus" AS ENUM ('draft', 'sending', 'sent', 'failed', 'partial');

-- CreateEnum
CREATE TYPE "CampaignSendStatus" AS ENUM ('pending', 'sent', 'failed', 'skipped');

-- CreateTable
CREATE TABLE "MarketingConsent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "MarketingConsentStatus" NOT NULL,
    "source" TEXT NOT NULL,
    "opted_in_at" TIMESTAMP(3),
    "opted_out_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCampaign" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_by_user_id" TEXT,
    "status" "EmailCampaignStatus" NOT NULL DEFAULT 'draft',
    "recipient_count" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSend" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "CampaignSendStatus" NOT NULL DEFAULT 'pending',
    "error_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketingConsent_email_key" ON "MarketingConsent"("email");

-- CreateIndex
CREATE INDEX "CampaignSend_campaign_id_idx" ON "CampaignSend"("campaign_id");

-- AddForeignKey
ALTER TABLE "CampaignSend" ADD CONSTRAINT "CampaignSend_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
