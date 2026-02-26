import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEmployerCompanyFromSession } from "@/lib/employerAuth";
import { processPurchase, PACKAGE_PRICING } from "@/lib/vacancyManager";

const PACKAGE_TYPES = ["1", "5", "10", "unlimited"] as const;

const PACKAGE_LABELS: Record<string, string> = {
  "1": "1 vacancy",
  "5": "5 vacancies",
  "10": "10 vacancies",
  unlimited: "Unlimited",
};

/** GET /api/subscriptions — current employer's subscription + available_slots from Company. */
export async function GET(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
    }

    let availableSlotsValue: number = 10;
    try {
      const company = await prisma.company.findUnique({
        where: { id: ctx.companyId },
        select: { id: true, availableSlots: true },
      });
      if (!company) {
        return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
      }
      const raw = (company as { availableSlots?: number }).availableSlots;
      if (typeof raw === "number" && raw >= 0) availableSlotsValue = raw;
      if (availableSlotsValue < 10) availableSlotsValue = 10;
    } catch {
      availableSlotsValue = 10;
    }

    if (availableSlotsValue < 10) {
      await prisma.company.update({
        where: { id: ctx.companyId },
        data: { availableSlots: 10 },
      }).catch(() => {});
      availableSlotsValue = 10;
    }
    await prisma.company.updateMany({
      where: { availableSlots: { lt: 10 } },
      data: { availableSlots: 10 },
    }).catch(() => {});

    const [latest, vacancyCount] = await Promise.all([
      prisma.subscription.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vacancy.count({ where: { companyId: ctx.companyId, status: "PUBLISHED" } }),
    ]);

    if (!latest) {
      return NextResponse.json({
        subscription: null,
        availableSlots: availableSlotsValue,
      }, { status: 200 });
    }

    const vacanciesUsed = vacancyCount;
    return NextResponse.json({
      subscription: {
        packageLabel: PACKAGE_LABELS[latest.packageType] ?? latest.packageType,
        pricePaid: latest.pricePaid,
        validUntil: latest.validUntil.toISOString().slice(0, 10),
        vacanciesUsed,
        vacanciesTotal: latest.vacanciesTotal,
      },
      availableSlots: availableSlotsValue,
    });
  } catch (e) {
    console.error("Subscription get error:", e);
    return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
  }
}

/** POST /api/subscriptions — record purchase and add vacancy slots (VacancyManager.processPurchase). */
export async function POST(request: Request) {
  try {
    const ctx = await getEmployerCompanyFromSession(request);
    if (!ctx) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const packageIdRaw =
      (typeof body?.packageType === "string" && body.packageType.trim()) ||
      (typeof body?.packageId === "string" && body.packageId.trim()) ||
      "1";
    const packageId = PACKAGE_TYPES.includes(packageIdRaw as (typeof PACKAGE_TYPES)[number])
      ? (packageIdRaw as (typeof PACKAGE_TYPES)[number])
      : "1";
    const pricing = PACKAGE_PRICING[packageId];
    const amountPaid = typeof body?.pricePaid === "number" ? body.pricePaid : (typeof body?.price === "number" ? body.price : pricing.price);

    const result = await processPurchase(ctx.companyId, packageId, amountPaid);

    return NextResponse.json({
      subscriptionId: result.subscriptionId,
      companyId: ctx.companyId,
      validUntil: result.validUntil,
      slotsAdded: result.slotsAdded,
    });
  } catch (e) {
    const err = e as Error & { code?: string };
    console.error("Subscription create error:", err?.message ?? e, err);
    const isDbError =
      err?.message?.includes("does not exist") ||
      err?.message?.includes("relation") ||
      err?.code === "P2021" ||
      err?.code === "P2010";
    const message = isDbError
      ? "Database tables missing. Run: npx prisma db push (or run prisma/sql/add-available-slots-and-purchases.sql)."
      : "Failed to create subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
