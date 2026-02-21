import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session";

const PACKAGE_TYPES = ["1", "5", "10", "unlimited"] as const;
const VALIDITY_YEARS = 1;

const PACKAGE_LABELS: Record<string, string> = {
  "1": "1 vacancy",
  "5": "5 vacancies",
  "10": "10 vacancies",
  unlimited: "Unlimited",
};

/** GET /api/subscriptions — current employer's subscription (from session) + vacancy count as used. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ subscription: null }, { status: 200 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!session || session.expiresAt < new Date() || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ subscription: null }, { status: 200 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!company) {
      return NextResponse.json({ subscription: null }, { status: 200 });
    }

    const [latest, vacancyCount] = await Promise.all([
      prisma.subscription.findFirst({
        where: { companyId: company.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.vacancy.count({ where: { companyId: company.id, status: "PUBLISHED" } }),
    ]);

    if (!latest) {
      return NextResponse.json({ subscription: null }, { status: 200 });
    }

    // vacanciesUsed = actual count of published vacancies (so UI shows truth; may exceed plan)
    const vacanciesUsed = vacancyCount;
    return NextResponse.json({
      subscription: {
        packageLabel: PACKAGE_LABELS[latest.packageType] ?? latest.packageType,
        pricePaid: latest.pricePaid,
        validUntil: latest.validUntil.toISOString().slice(0, 10),
        vacanciesUsed,
        vacanciesTotal: latest.vacanciesTotal,
      },
    });
  } catch (e) {
    console.error("Subscription get error:", e);
    return NextResponse.json({ subscription: null }, { status: 200 });
  }
}

/** POST /api/subscriptions — create a subscription for the current employer (session). */
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
    // Support both packageType and packageId so frontend package selection is recorded correctly
    const packageTypeRaw =
      (typeof body?.packageType === "string" && body.packageType.trim()) ||
      (typeof body?.packageId === "string" && body.packageId.trim()) ||
      "1";
    const packageType = PACKAGE_TYPES.includes(packageTypeRaw as (typeof PACKAGE_TYPES)[number])
      ? (packageTypeRaw as (typeof PACKAGE_TYPES)[number])
      : "1";
    const pricePaid = typeof body?.pricePaid === "number" ? Math.max(0, body.pricePaid) : body?.price ?? 40;
    const vacanciesTotal = packageType === "unlimited" ? -1 : parseInt(packageType, 10) || 1;

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + VALIDITY_YEARS);

    const subscription = await prisma.subscription.create({
      data: {
        companyId: company.id,
        packageType,
        pricePaid,
        validUntil,
        vacanciesTotal,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      companyId: company.id,
      validUntil: subscription.validUntil.toISOString(),
    });
  } catch (e) {
    console.error("Subscription create error:", e);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
