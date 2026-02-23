-- Subscription/vacancy slots: add available_slots to companies and ensure purchases table exists.
-- Run in Supabase SQL Editor (or psql) if npx prisma db push is not possible.
-- After running, redeploy or restart the app so GET /api/subscriptions returns availableSlots.

-- 1) Add vacancy slot balance to companies (default 10)
ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "available_slots" INTEGER NOT NULL DEFAULT 10;

-- 2) Create purchases table if missing (for slot top-ups)
CREATE TABLE IF NOT EXISTS "purchases" (
  "id" TEXT NOT NULL,
  "company_id" TEXT NOT NULL,
  "package_type" TEXT NOT NULL,
  "amount_paid" INTEGER NOT NULL,
  "slots_added" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- If your companies table has a different name (e.g. "companies"), use that in ALTER TABLE.
-- Prisma default for model Company is table "Company".
