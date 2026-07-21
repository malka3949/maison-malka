-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "legal_consent_version" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AccessAuditLog" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_email" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "detail" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AccessAuditLog_created_at_idx" ON "AccessAuditLog"("created_at");
CREATE INDEX IF NOT EXISTS "AccessAuditLog_action_idx" ON "AccessAuditLog"("action");
