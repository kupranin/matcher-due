/**
 * Seed vacancies for all companies that have seed definitions, EXCEPT Nikora.
 * Matches companies by name (case-insensitive). DB names: DeGusto, Nail Bar, etc.
 *
 * Run: npx tsx prisma/seed-all-companies-except-nikora.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const TBILISI_ID = "tbilisi";
const EXCLUDE_COMPANY_NAMES = ["nikora"];

type VacancyInput = {
  title: string;
  salaryMin: number;
  salaryMax: number;
  workType: string;
  requiredExperienceMonths: number;
  requiredEducationLevel: string;
  description: string;
  requiredSkills: Array<{ name: string; level: string; weight: number }>;
  preferredSkills?: Array<{ name: string; level: string; weight: number }>;
};

// DeGusto (restaurant) – 4 vacancies
const DEGUSTO_VACANCIES: VacancyInput[] = [
  {
    title: "Assistant Cook",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Assist chefs in food preparation; prepare ingredients and basic dishes; maintain kitchen cleanliness and organization; support kitchen operations during busy hours. 0–1 year preferred.",
    requiredSkills: [
      { name: "Basic cooking knowledge", level: "Intermediate", weight: 5 },
      { name: "Kitchen hygiene practices", level: "Intermediate", weight: 5 },
      { name: "Food preparation", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Speed and efficiency", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Restaurant kitchen experience", level: "Beginner", weight: 3 },
      { name: "Culinary training", level: "Beginner", weight: 2 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description:
      "Process customer payments; operate POS system; issue receipts; assist customers with orders; coordinate with kitchen staff. 0–1 year preferred.",
    requiredSkills: [
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "POS operation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [{ name: "Restaurant cashier experience", level: "Beginner", weight: 2 }],
  },
  {
    title: "Waitress / Waiter",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Greet and serve customers; take food and beverage orders; deliver meals to tables; maintain cleanliness of dining area; provide friendly service. Salary + tips. No experience required.",
    requiredSkills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Multitasking", level: "Intermediate", weight: 4 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Patience", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
    ],
    preferredSkills: [
      { name: "Restaurant service experience", level: "Beginner", weight: 2 },
      { name: "Basic English", level: "Beginner", weight: 2 },
    ],
  },
  {
    title: "Dishwasher",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Wash dishes and kitchen equipment; maintain kitchen hygiene; assist kitchen staff with basic tasks; ensure cleanliness of dishwashing area. No experience required.",
    requiredSkills: [
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Attention to hygiene", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Teamwork", level: "Intermediate", weight: 4 },
    ],
  },
];

// Nail Bar (beauty salon) – 1 vacancy
const NAIL_BAR_VACANCIES: VacancyInput[] = [
  {
    title: "Salon Administrator",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "None",
    description:
      "Manage client appointments; greet and assist customers; coordinate salon staff schedules; manage phone and social media bookings; handle payments and POS system; ensure smooth daily salon operations. Georgian required; Russian or English preferred. 0–2 years preferred.",
    requiredSkills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Appointment scheduling", level: "Intermediate", weight: 5 },
      { name: "POS system operation", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Multitasking", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Beauty salon experience", level: "Beginner", weight: 3 },
      { name: "Social media messaging", level: "Beginner", weight: 2 },
      { name: "Basic sales skills", level: "Beginner", weight: 2 },
    ],
  },
];

// Kalata (retail) – 3 vacancies
const KALATA_VACANCIES: VacancyInput[] = [
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "None",
    description:
      "Process customer payments; operate POS system; issue receipts and invoices; assist customers with purchases; maintain accuracy of cash register. 0–1 year preferred.",
    requiredSkills: [
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "POS system operation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Retail cashier experience", level: "Beginner", weight: 3 },
      { name: "Basic inventory awareness", level: "Beginner", weight: 2 },
    ],
  },
  {
    title: "Store Administrator",
    salaryMin: 1400,
    salaryMax: 1900,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description:
      "Supervise store operations; coordinate store employees; monitor sales and inventory; prepare daily reports; ensure high customer service standards. 1–3 years preferred, Bachelor preferred.",
    requiredSkills: [
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
      { name: "Inventory management", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Decision making", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 3 },
      { name: "Store management experience", level: "Beginner", weight: 3 },
    ],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 900,
    salaryMax: 1200,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Receive and sort goods; organize inventory in warehouse; prepare products for store delivery; maintain warehouse cleanliness. No experience required.",
    requiredSkills: [
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
    preferredSkills: [
      { name: "Warehouse experience", level: "Beginner", weight: 2 },
      { name: "Logistics basics", level: "Beginner", weight: 2 },
    ],
  },
];

// Gorgia (home improvement / construction materials / appliances retail) – 8 vacancies
const GORGIA_VACANCIES: VacancyInput[] = [
  {
    title: "Merchandiser",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "High School",
    description:
      "Organize product displays; ensure correct product placement; monitor shelf stock; coordinate with sales team.",
    requiredSkills: [
      { name: "Merchandising", level: "Intermediate", weight: 5 },
      { name: "Product organization", level: "Intermediate", weight: 5 },
      { name: "Retail operations", level: "Intermediate", weight: 4 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Brand Manager",
    salaryMin: 2200,
    salaryMax: 3000,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description:
      "Manage product brands in store; coordinate marketing campaigns; analyze sales performance; cooperate with suppliers.",
    requiredSkills: [
      { name: "Brand management", level: "Advanced", weight: 5 },
      { name: "Marketing", level: "Intermediate", weight: 5 },
      { name: "Retail analytics", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Strategic thinking", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Sales Consultant",
    salaryMin: 1200,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Consult customers on products; assist with appliance and construction product selection; demonstrate product features.",
    requiredSkills: [
      { name: "Sales", level: "Intermediate", weight: 5 },
      { name: "Product knowledge", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Persuasion", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Promoter",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Promote specific brands; demonstrate products to customers; assist marketing campaigns in store.",
    requiredSkills: [
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Sales basics", level: "Intermediate", weight: 4 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Friendliness", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Service Worker",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Assist customers with loading products; maintain store order; support store operations.",
    requiredSkills: [
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Helpfulness", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Organize inventory; load and unload products; prepare goods for store floor.",
    requiredSkills: [
      { name: "Warehouse operations", level: "Intermediate", weight: 5 },
      { name: "Logistics basics", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description:
      "Process payments; operate POS system; issue receipts.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Store Administrator",
    salaryMin: 1600,
    salaryMax: 2200,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description:
      "Supervise store operations; coordinate employees; monitor inventory and sales.",
    requiredSkills: [
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
      { name: "Team coordination", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
  },
];

/** Company name in DB (or pattern) -> list of vacancies to seed */
const COMPANY_VACANCIES: Array<{ nameMatch: string[]; vacancies: VacancyInput[] }> = [
  { nameMatch: ["degusto", "de gusto"], vacancies: DEGUSTO_VACANCIES },
  { nameMatch: ["nail bar", "saloon nail bar"], vacancies: NAIL_BAR_VACANCIES },
  { nameMatch: ["kalata"], vacancies: KALATA_VACANCIES },
  { nameMatch: ["gorgia"], vacancies: GORGIA_VACANCIES },
];

function companyMatches(name: string, matchList: string[]): boolean {
  const lower = name.toLowerCase().trim();
  return matchList.some((m) => lower === m || lower.includes(m));
}

async function seedVacanciesForCompany(
  company: { id: string; name: string },
  vacancies: VacancyInput[]
): Promise<number> {
  let created = 0;
  for (const v of vacancies) {
    const existing = await prisma.vacancy.findFirst({
      where: { companyId: company.id, title: v.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.vacancy.update({
        where: { id: existing.id },
        data: { salaryMin: v.salaryMin, salaryMax: v.salaryMax },
      });
      console.log(`    Updated: ${v.title} → ${v.salaryMin}–${v.salaryMax} GEL`);
      continue;
    }

    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: company.id,
        title: v.title,
        locationCityId: TBILISI_ID,
        salaryMin: v.salaryMin,
        salaryMax: v.salaryMax,
        workType: v.workType,
        isRemote: false,
        requiredExperienceMonths: v.requiredExperienceMonths,
        requiredEducationLevel: v.requiredEducationLevel,
        description: v.description,
        status: "PUBLISHED",
      },
    });

    const allSkills: Array<{ name: string; level: string; weight: number; isRequired: boolean }> = [
      ...v.requiredSkills.map((s) => ({ ...s, isRequired: true })),
      ...(v.preferredSkills ?? []).map((s) => ({ ...s, isRequired: false })),
    ];

    await prisma.vacancySkill.createMany({
      data: allSkills.map((s) => ({
        vacancyId: vacancy.id,
        name: s.name,
        level: s.level as "Beginner" | "Intermediate" | "Advanced",
        weight: s.weight,
        isRequired: s.isRequired,
      })),
    });

    created++;
    console.log(`    Created: ${v.title} (${allSkills.length} skills)`);
  }
  return created;
}

async function main() {
  console.log("Connecting to database...\n");
  await prisma.$connect();

  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  const excluded = allCompanies.filter((c) =>
    EXCLUDE_COMPANY_NAMES.some((ex) => c.name.toLowerCase().trim() === ex)
  );
  const toSeed = allCompanies.filter(
    (c) => !EXCLUDE_COMPANY_NAMES.some((ex) => c.name.toLowerCase().trim() === ex)
  );

  console.log(`Companies in DB: ${allCompanies.length}`);
  console.log(`Excluded (Nikora): ${excluded.map((c) => c.name).join(", ") || "(none)"}`);
  console.log(`To process: ${toSeed.map((c) => c.name).join(", ")}\n`);

  let totalCreated = 0;

  for (const company of toSeed) {
    const config = COMPANY_VACANCIES.find((cfg) => companyMatches(company.name, cfg.nameMatch));
    if (!config) {
      console.log(`  ${company.name}: no vacancy definitions, skipping`);
      continue;
    }

    console.log(`  ${company.name} (id: ${company.id}):`);
    const created = await seedVacanciesForCompany(company, config.vacancies);
    totalCreated += created;
    if (created === 0 && config.vacancies.length > 0) {
      console.log(`    (all ${config.vacancies.length} vacancies already existed, salaries updated if needed)`);
    }
    console.log("");
  }

  console.log("--- Done ---");
  console.log(`Vacancies created this run: ${totalCreated}`);
  console.log("All seeded vacancies are PUBLISHED. Nikora was excluded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
