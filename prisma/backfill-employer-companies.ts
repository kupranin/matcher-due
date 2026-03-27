/**
 * Backfill Company rows for existing employer users that have none.
 * Run: npx tsx prisma/backfill-employer-companies.ts
 * Then run: npx prisma db push (if Company table is missing columns like contact_phone, available_slots)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);

async function main() {
  console.log("Finding employer users without a company...");
  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER" },
    select: { id: true, email: true },
  });
  const withCompany = await prisma.company.findMany({
    where: { userId: { in: employers.map((e) => e.id) } },
    select: { userId: true },
  });
  const userIdsWithCompany = new Set(withCompany.map((c) => c.userId));
  const missing = employers.filter((e) => !userIdsWithCompany.has(e.id));
  if (missing.length === 0) {
    console.log("All employer users already have a company. Done.");
    return;
  }
  console.log(`Creating company for ${missing.length} employer(s)...`);
  for (const user of missing) {
    const name = user.email.split("@")[0] || "Company";
    await prisma.company.create({
      data: {
        userId: user.id,
        name,
        companyId: "N/A",
        contactEmail: user.email,
        contactPhone: "—",
        availableSlots: 10,
      },
    });
    console.log(`  Created company for ${user.email}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
