/**
 * Add vacancies for existing company "Gorgia".
 * Run: npx tsx prisma/seed-gorgia-vacancies.ts
 *
 * IMPORTANT: Does NOT create a company. Finds Company where name = "Gorgia" and attaches vacancies.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const COMPANY_NAME = "Gorgia";
const TBILISI_ID = "tbilisi";

type VacancyInput = {
  normalizedTitle: string;
  targetRole: string;
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

const VACANCIES: VacancyInput[] = [
  {
    normalizedTitle: "merchandiser",
    targetRole: "Merchandiser",
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
    normalizedTitle: "brand_manager",
    targetRole: "Brand Manager",
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
    normalizedTitle: "sales_consultant",
    targetRole: "Sales Consultant",
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
    normalizedTitle: "promoter",
    targetRole: "Promoter",
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
    normalizedTitle: "service_worker",
    targetRole: "Service Worker",
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
    normalizedTitle: "warehouse_worker",
    targetRole: "Warehouse Worker",
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
    normalizedTitle: "cashier",
    targetRole: "Cashier",
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
    normalizedTitle: "store_administrator",
    targetRole: "Store Administrator",
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

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  let company = await prisma.company.findFirst({
    where: { name: { equals: COMPANY_NAME, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!company) {
    const all = await prisma.company.findMany({ select: { id: true, name: true } });
    company = all.find((c) => c.name.toLowerCase().includes("gorgia")) ?? null;
  }

  if (!company) {
    throw new Error(
      `Company "${COMPANY_NAME}" not found. Create the company first (e.g. via employer registration), then run this script again.`
    );
  }

  console.log(`Found company: ${company.name} (id: ${company.id})\n`);

  const created: Array<{ id: string; title: string; skillsCount: number }> = [];

  for (const v of VACANCIES) {
    const existing = await prisma.vacancy.findFirst({
      where: { companyId: company!.id, title: v.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.vacancy.update({
        where: { id: existing.id },
        data: { salaryMin: v.salaryMin, salaryMax: v.salaryMax },
      });
      console.log(`  Updated salary: ${v.title} → ${v.salaryMin}–${v.salaryMax} GEL`);
      continue;
    }

    const vacancy = await prisma.vacancy.create({
      data: {
        companyId: company!.id,
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

    created.push({ id: vacancy.id, title: vacancy.title, skillsCount: allSkills.length });
    console.log(`  Created: ${v.title} (id: ${vacancy.id}, ${allSkills.length} skills)`);
  }

  console.log("\n--- Summary ---");
  console.log(`Company: ${company.name} (id: ${company.id})`);
  console.log(`Vacancies created: ${created.length}`);
  created.forEach((c) => console.log(`  - ${c.title} (${c.skillsCount} skills)`));
  console.log("\nConfirmation: All new vacancies are PUBLISHED and attached to the existing Gorgia company_id:", company.id);

  const tagsByVacancy: Record<string, string[]> = {
    Merchandiser: ["merchandising", "retail display", "inventory"],
    "Brand Manager": ["brand management", "marketing", "retail strategy"],
    "Sales Consultant": ["retail sales", "appliances", "construction products"],
    Promoter: ["promotion", "marketing", "retail"],
    "Service Worker": ["store support", "operations", "retail"],
    "Warehouse Worker": ["warehouse", "logistics", "inventory"],
    Cashier: ["cashier", "retail", "payments"],
    "Store Administrator": ["store management", "operations"],
  };
  const softSkillsByVacancy: Record<string, string[]> = {
    Merchandiser: ["attention to detail", "organization"],
    "Brand Manager": ["leadership", "strategic thinking"],
    "Sales Consultant": ["persuasion", "communication"],
    Promoter: ["communication", "friendliness"],
    "Service Worker": ["reliability", "helpfulness"],
    "Warehouse Worker": ["responsibility", "discipline"],
    Cashier: ["accuracy", "responsibility"],
    "Store Administrator": ["leadership", "organization"],
  };

  console.log("\n--- Structured JSON (for reference) ---");
  const jsonPayload = {
    company_id: company.id,
    company_name: company.name,
    confirmation: "Vacancies attached to existing Gorgia company_id",
    vacancies: VACANCIES.map((v) => ({
      normalizedTitle: v.normalizedTitle,
      targetRole: v.targetRole,
      title: v.title,
      seniorityLevel: v.requiredExperienceMonths >= 36 ? "Senior" : v.requiredExperienceMonths >= 12 ? "Mid" : "Entry",
      experienceMonths: v.requiredExperienceMonths,
      salaryMin: v.salaryMin,
      salaryMax: v.salaryMax,
      employmentType: v.workType,
      requiredSkills: v.requiredSkills.map((s) => s.name),
      softSkills: softSkillsByVacancy[v.title] ?? [],
      tags: tagsByVacancy[v.title] ?? [],
    })),
  };
  console.log(JSON.stringify(jsonPayload, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
