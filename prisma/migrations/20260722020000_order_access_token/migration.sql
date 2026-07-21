-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "access_token" TEXT;

-- Backfill existing rows
UPDATE "Order" SET "access_token" = md5(random()::text || id || clock_timestamp()::text) WHERE "access_token" IS NULL;

-- Enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "Order_access_token_key" ON "Order"("access_token");

ALTER TABLE "Order" ALTER COLUMN "access_token" SET NOT NULL;
