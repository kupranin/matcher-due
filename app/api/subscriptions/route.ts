import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { processPurchase, PACKAGE_PRICING } from "@/lib/vacancyManager";

const PACKAGE_TYPES = ["1", "5", "10", "unlimited"] as const;
const VALIDITY_YEARS = 1;

const PACKAGE_LABELS: Record<string, string> = {
  "1": "1 vacancy",
  "5": "5 vacancies",
  "10": "10 vacancies",
  unlimited: "Unlimited",
};

/** GET /api/subscriptions — current employer's subscription + available_slots from Company. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!session || session.expiresAt < new Date() || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      select: { id: true, availableSlots: true },
    });
    if (!company) {
      return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
    }

    const [latest, vacancyCount] = await Promise.all([
      prisma.subscription.findFirst({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vacancy.count({ where: { companyId: company.id, status: "PUBLISHED" } }),
    ]);

    if (!latest) {
      return NextResponse.json({
        subscription: null,
        availableSlots: company.availableSlots,
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
      availableSlots: company.availableSlots,
    });
  } catch (e) {
    console.error("Subscription get error:", e);
    return NextResponse.json({ subscription: null, availableSlots: null }, { status: 200 });
  }
}

/** POST /api/subscriptions — record purchase and add vacancy slots (VacancyManager.processPurchase). */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Employer account required" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found. Post a vacancy first or complete registration." }, { status: 400 });
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

    const result = await processPurchase(company.id, packageId, amountPaid);

    return NextResponse.json({
      subscriptionId: result.subscriptionId,
      companyId: company.id,
      validUntil: result.validUntil,
      slotsAdded: result.slotsAdded,
    });
  } catch (e) {
    console.error("Subscription create error:", e);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
