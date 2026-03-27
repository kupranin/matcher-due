/**
 * VacancyManager — vacancy slot balance and purchase handling.
 *
 * - All companies start with 10 available_slots.
 * - Posting a vacancy deducts 1 slot (in a transaction); if slots <= 0, throws STRICT_PAYWALL_ERROR.
 * - processPurchase adds slots and logs the Purchase; unlimited = 9999 slots + 1-year Subscription.
 */

import { prisma } from "@/lib/db";

export const STRICT_PAYWALL_ERROR = "STRICT_PAYWALL_ERROR";

/** Package id → { price GEL, slots to add }. Unlimited = 9999 slots, valid 1 year via Subscription. */
export const PACKAGE_PRICING: Record<string, { price: number; slots: number }> = {
  "1": { price: 65, slots: 1 },
  "5": { price: 170, slots: 5 },
  "10": { price: 400, slots: 10 },
  unlimited: { price: 1000, slots: 9999 },
};

const UNLIMITED_SLOTS = 9999;
const VALIDITY_YEARS = 1;

/**
 * Deduct one vacancy slot for the company. Call inside a transaction before creating the vacancy.
 * If available_slots <= 0, throws an error with message STRICT_PAYWALL_ERROR so the API can return 402 and redirect to pricing.
 */
export async function deductSlot(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, availableSlots: true },
  });
  if (!company) throw new Error("Company not found");
  if (company.availableSlots <= 0) {
    const err = new Error(STRICT_PAYWALL_ERROR) as Error & { code?: string };
    err.code = STRICT_PAYWALL_ERROR;
    throw err;
  }
  await prisma.company.update({
    where: { id: companyId },
    data: { availableSlots: { decrement: 1 } },
  });
}

/**
 * Same as deductSlot but to be used inside an existing transaction (client).
 * Use prisma.$transaction(async (tx) => { await deductSlotInTx(tx, companyId); ... }).
 */
export async function deductSlotInTx(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  companyId: string
): Promise<void> {
  const company = await tx.company.findUnique({
    where: { id: companyId },
    select: { id: true, availableSlots: true },
  });
  if (!company) throw new Error("Company not found");
  if (company.availableSlots <= 0) {
    const err = new Error(STRICT_PAYWALL_ERROR) as Error & { code?: string };
    err.code = STRICT_PAYWALL_ERROR;
    throw err;
  }
  await tx.company.update({
    where: { id: companyId },
    data: { availableSlots: { decrement: 1 } },
  });
}

/**
 * Process a purchase: add slots to the company and log the transaction in Purchase.
 * Also creates a Subscription record with validUntil = now + 1 year (for UI display).
 * Does not validate payment (caller must ensure payment is confirmed).
 */
export async function processPurchase(
  companyId: string,
  packageId: string,
  amountPaid: number
): Promise<{ slotsAdded: number; subscriptionId?: string; validUntil?: string }> {
  const key = ["1", "5", "10", "unlimited"].includes(packageId) ? packageId : "1";
  const { price, slots } = PACKAGE_PRICING[key];
  const slotsAdded = key === "unlimited" ? UNLIMITED_SLOTS : slots;

  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + VALIDITY_YEARS);

  let subscriptionId: string | undefined;

  await prisma.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: { availableSlots: { increment: slotsAdded } },
    });
    await tx.purchase.create({
      data: {
        companyId,
        packageType: key,
        amountPaid: Math.round(amountPaid),
        slotsAdded,
      },
    });
    const sub = await tx.subscription.create({
      data: {
        companyId,
        packageType: key,
        pricePaid: Math.round(amountPaid),
        validUntil,
        vacanciesTotal: key === "unlimited" ? -1 : slotsAdded,
      },
    });
    subscriptionId = sub.id;
  });

  return {
    slotsAdded,
    subscriptionId,
    validUntil: validUntil.toISOString().slice(0, 10),
  };
}

/**
 * Returns current available_slots for the company (for UI / checks).
 */
export async function getAvailableSlots(companyId: string): Promise<number> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { availableSlots: true },
  });
  return company?.availableSlots ?? 0;
}
