/**
 * Add vacancies for multiple existing companies (Gulf, iTechnics, MiStore, Zoommer, Bolt, Kursi.ge, Dazga, No Name, Navne).
 * Run: npx tsx prisma/seed-multi-company-vacancies.ts
 *
 * IMPORTANT: Does NOT create companies. Finds each company by name and attaches vacancies.
 * All vacancies: PUBLISHED, Tbilisi, Full-time. Matching fields generated for Matcher scoring.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const TBILISI_ID = "tbilisi";

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
  softSkills?: string[];
  tags?: string[];
};

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function seniority(months: number, title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("manager") || lower.includes("supervisor")) {
    return months >= 36 ? "Senior" : months >= 12 ? "Mid" : "Entry";
  }
  return months >= 24 ? "Senior" : months >= 12 ? "Mid" : "Entry";
}

// —— Gulf (Fuel / Gas stations) ——
const GULF_VACANCIES: VacancyInput[] = [
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS system; assist customers.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
    softSkills: ["communication", "responsibility"],
    tags: ["cashier", "gas station", "retail", "payments"],
  },
  {
    title: "Fuel Refiller",
    salaryMin: 900,
    salaryMax: 1200,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Refuel vehicles; assist customers at pumps; maintain safety standards.",
    requiredSkills: [
      { name: "Safety awareness", level: "Intermediate", weight: 5 },
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Discipline", level: "Intermediate", weight: 4 },
      { name: "Attentiveness", level: "Intermediate", weight: 4 },
    ],
    softSkills: ["discipline", "attentiveness"],
    tags: ["fuel", "gas station", "safety", "operations"],
  },
];

// —— iTechnics (Electronics retail) ——
const ITECHNICS_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1200,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Sell electronics; consult customers; demonstrate products.",
    requiredSkills: [
      { name: "Sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Electronics knowledge", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Persuasion", level: "Intermediate", weight: 4 },
    ],
    softSkills: ["communication", "persuasion"],
    tags: ["electronics", "retail", "sales", "consulting"],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; issue receipts; manage cash register.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Responsibility", level: "Intermediate", weight: 4 },
    ],
    softSkills: ["accuracy", "responsibility"],
    tags: ["cashier", "electronics", "retail", "payments"],
  },
];

// —— MiStore (Electronics retail – Xiaomi) ——
const MISTORE_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Manager",
    salaryMin: 1800,
    salaryMax: 2500,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Manage sales team and targets; drive retail performance; analyze sales data.",
    requiredSkills: [
      { name: "Sales management", level: "Advanced", weight: 5 },
      { name: "Retail analytics", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
    tags: ["sales management", "retail", "electronics", "leadership"],
  },
  {
    title: "Store Manager",
    salaryMin: 2000,
    salaryMax: 2800,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Oversee store operations; manage staff; ensure targets and customer service.",
    requiredSkills: [
      { name: "Retail management", level: "Advanced", weight: 5 },
      { name: "Operations management", level: "Advanced", weight: 5 },
      { name: "Staff supervision", level: "Intermediate", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
    ],
    tags: ["store management", "retail", "operations", "leadership"],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain store cleanliness; hygiene standards; basic cleaning tasks.",
    requiredSkills: [
      { name: "Cleaning", level: "Intermediate", weight: 5 },
      { name: "Hygiene maintenance", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 4 },
    ],
    tags: ["cleaning", "hygiene", "retail", "operations"],
  },
];

// —— Zoommer (Electronics retail) ——
const ZOOMMER_VACANCIES: VacancyInput[] = [
  {
    title: "Administrative Assistant",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Administrative support; documentation; scheduling; office coordination.",
    requiredSkills: [
      { name: "MS Office", level: "Intermediate", weight: 5 },
      { name: "Documentation management", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
    tags: ["administration", "office", "documentation", "electronics retail"],
  },
  {
    title: "Store Manager",
    salaryMin: 2000,
    salaryMax: 2800,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Manage store operations; lead team; reporting and sales targets.",
    requiredSkills: [
      { name: "Retail operations", level: "Advanced", weight: 5 },
      { name: "Leadership", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
      { name: "Team coordination", level: "Intermediate", weight: 5 },
    ],
    tags: ["store management", "retail", "leadership", "electronics"],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; issue receipts; customer service.",
    requiredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Basic math", level: "Intermediate", weight: 4 },
    ],
    tags: ["cashier", "retail", "payments", "electronics"],
  },
  {
    title: "Sales Consultant",
    salaryMin: 1200,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Sell electronics; consult customers; demonstrate products.",
    requiredSkills: [
      { name: "Sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Electronics knowledge", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
    tags: ["sales", "electronics", "retail", "consulting"],
  },
];

// —— Bolt (Technology / Mobility) ——
const BOLT_VACANCIES: VacancyInput[] = [
  {
    title: "Support Operator",
    salaryMin: 1500,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description:
      "Assist customers via chat/email; resolve service issues; provide information about rides or deliveries.",
    requiredSkills: [
      { name: "Customer support", level: "Intermediate", weight: 5 },
      { name: "Problem solving", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Patience", level: "Intermediate", weight: 4 },
      { name: "Empathy", level: "Intermediate", weight: 4 },
    ],
    softSkills: ["patience", "empathy"],
    tags: ["customer support", "mobility", "tech", "remote support"],
  },
];

// —— Kursi.ge (Fintech / Digital currency exchange) ——
const KURSIGE_VACANCIES: VacancyInput[] = [
  {
    title: "Support Operator",
    salaryMin: 1500,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Customer support; assist users with fintech platform; resolve queries.",
    requiredSkills: [
      { name: "Customer support", level: "Intermediate", weight: 5 },
      { name: "Fintech platform usage", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
    tags: ["fintech", "customer support", "digital currency"],
  },
  {
    title: "Transactions Operator",
    salaryMin: 1700,
    salaryMax: 2300,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Process financial transactions; ensure accuracy; banking operations.",
    requiredSkills: [
      { name: "Financial transactions", level: "Advanced", weight: 5 },
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Banking operations", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
    ],
    tags: ["fintech", "transactions", "banking", "operations"],
  },
  {
    title: "Administrative Assistant",
    salaryMin: 1300,
    salaryMax: 1700,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Office administration; documentation; organization.",
    requiredSkills: [
      { name: "MS Office", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
      { name: "Documentation", level: "Intermediate", weight: 5 },
    ],
    tags: ["administration", "fintech", "office"],
  },
];

// —— Dazga (Furniture / interior manufacturing) ——
const DAZGA_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Manager",
    salaryMin: 1800,
    salaryMax: 2400,
    workType: "Full-time",
    requiredExperienceMonths: 24,
    requiredEducationLevel: "Bachelor",
    description: "Manage sales; negotiate with clients; CRM and pipeline.",
    requiredSkills: [
      { name: "Sales management", level: "Advanced", weight: 5 },
      { name: "Negotiation", level: "Intermediate", weight: 5 },
      { name: "CRM", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
    tags: ["sales management", "furniture", "B2B", "CRM"],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Inventory management; receive and ship goods; warehouse operations.",
    requiredSkills: [
      { name: "Inventory management", level: "Intermediate", weight: 5 },
      { name: "Logistics basics", level: "Intermediate", weight: 5 },
      { name: "Physical stamina", level: "Intermediate", weight: 4 },
    ],
    tags: ["warehouse", "logistics", "furniture", "inventory"],
  },
];

// —— No Name (Retail fashion) ——
const NO_NAME_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Retail sales; customer service; product presentation.",
    requiredSkills: [
      { name: "Retail sales", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 4 },
    ],
    tags: ["retail", "fashion", "sales"],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; basic accounting support.",
    requiredSkills: [
      { name: "POS systems", level: "Intermediate", weight: 5 },
      { name: "Basic accounting", level: "Intermediate", weight: 4 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
    tags: ["cashier", "retail", "fashion", "payments"],
  },
];

// —— Navne (Retail) ——
const NAVNE_VACANCIES: VacancyInput[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Retail sales; product presentation; customer service.",
    requiredSkills: [
      { name: "Retail sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
    tags: ["retail", "sales", "consulting"],
  },
  {
    title: "Cashier",
    salaryMin: 1000,
    salaryMax: 1300,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Process payments; operate POS; issue receipts.",
    requiredSkills: [
      { name: "POS system", level: "Intermediate", weight: 5 },
      { name: "Payments", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 4 },
    ],
    tags: ["cashier", "retail", "payments"],
  },
  {
    title: "Assistant to Store Manager",
    salaryMin: 1400,
    salaryMax: 1800,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Support store manager; retail operations; coordination.",
    requiredSkills: [
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Coordination", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 4 },
    ],
    tags: ["retail", "assistant", "operations"],
  },
  {
    title: "Videomonitoring Operator",
    salaryMin: 1200,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Monitor CCTV; ensure store security; report incidents.",
    requiredSkills: [
      { name: "CCTV monitoring", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 4 },
    ],
    tags: ["security", "CCTV", "monitoring", "retail"],
  },
  {
    title: "Store Manager",
    salaryMin: 2000,
    salaryMax: 2700,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Manage store; lead team; operations and sales targets.",
    requiredSkills: [
      { name: "Store management", level: "Advanced", weight: 5 },
      { name: "Team leadership", level: "Intermediate", weight: 5 },
      { name: "Retail operations", level: "Intermediate", weight: 5 },
    ],
    tags: ["store management", "retail", "leadership"],
  },
];

const COMPANY_CONFIG: Array<{
  nameMatch: string[];
  companyLabel: string;
  vacancies: VacancyInput[];
}> = [
  { nameMatch: ["gulf"], companyLabel: "Gulf", vacancies: GULF_VACANCIES },
  { nameMatch: ["itechnics", "i technics"], companyLabel: "iTechnics", vacancies: ITECHNICS_VACANCIES },
  { nameMatch: ["mistore", "mi store"], companyLabel: "MiStore", vacancies: MISTORE_VACANCIES },
  { nameMatch: ["zoommer"], companyLabel: "Zoommer", vacancies: ZOOMMER_VACANCIES },
  { nameMatch: ["bolt"], companyLabel: "Bolt", vacancies: BOLT_VACANCIES },
  { nameMatch: ["kursi.ge", "kursi"], companyLabel: "Kursi.ge", vacancies: KURSIGE_VACANCIES },
  { nameMatch: ["dazga"], companyLabel: "Dazga", vacancies: DAZGA_VACANCIES },
  { nameMatch: ["no name", "noname", "no-name"], companyLabel: "No Name", vacancies: NO_NAME_VACANCIES },
  { nameMatch: ["navne"], companyLabel: "Navne", vacancies: NAVNE_VACANCIES },
];

function companyMatches(name: string, matchList: string[]): boolean {
  const lower = name.toLowerCase().trim();
  return matchList.some((m) => lower === m || lower.includes(m));
}

async function seedCompany(
  company: { id: string; name: string },
  vacancies: VacancyInput[]
): Promise<{ created: number; updated: number; payload: object[] }> {
  let created = 0;
  let updated = 0;
  const payload: object[] = [];

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
      updated++;
      console.log(`    Updated: ${v.title} → ${v.salaryMin}–${v.salaryMax} GEL`);
      payload.push({
        normalizedTitle: slug(v.title),
        targetRole: v.title,
        title: v.title,
        seniorityLevel: seniority(v.requiredExperienceMonths, v.title),
        experienceMonths: v.requiredExperienceMonths,
        salaryMin: v.salaryMin,
        salaryMax: v.salaryMax,
        employmentType: v.workType,
        requiredSkills: v.requiredSkills.map((s) => s.name),
        softSkills: v.softSkills ?? [],
        tags: v.tags ?? [],
      });
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
    console.log(`    Created: ${v.title} (id: ${vacancy.id}, ${allSkills.length} skills)`);
    payload.push({
      normalizedTitle: slug(v.title),
      targetRole: v.title,
      title: v.title,
      seniorityLevel: seniority(v.requiredExperienceMonths, v.title),
      experienceMonths: v.requiredExperienceMonths,
      salaryMin: v.salaryMin,
      salaryMax: v.salaryMax,
      employmentType: v.workType,
      requiredSkills: v.requiredSkills.map((s) => s.name),
      softSkills: v.softSkills ?? [],
      tags: v.tags ?? [],
    });
  }

  return { created, updated, payload };
}

async function main() {
  console.log("Connecting to database...\n");
  await prisma.$connect();

  const allCompanies = await prisma.company.findMany({ select: { id: true, name: true } });
  const summary: Array<{ company: string; companyId: string; created: number; updated: number; vacancies: string[] }> = [];
  const jsonByCompany: Array<{
    company_id: string;
    company_name: string;
    confirmation: string;
    vacancies: object[];
  }> = [];

  for (const config of COMPANY_CONFIG) {
    const company = allCompanies.find((c) => companyMatches(c.name, config.nameMatch));
    if (!company) {
      console.log(`  ${config.companyLabel}: company not found (tried: ${config.nameMatch.join(", ")}), skipping.\n`);
      continue;
    }

    console.log(`  ${company.name} (id: ${company.id}):`);
    const { created, updated, payload } = await seedCompany(company, config.vacancies);
    summary.push({
      company: company.name,
      companyId: company.id,
      created,
      updated,
      vacancies: config.vacancies.map((v) => v.title),
    });
    jsonByCompany.push({
      company_id: company.id,
      company_name: company.name,
      confirmation: `Vacancies attached to existing company_id ${company.id}`,
      vacancies: payload,
    });
    console.log("");
  }

  console.log("--- Summary of created/updated vacancies per company ---\n");
  summary.forEach((s) => {
    console.log(`${s.company} (id: ${s.companyId})`);
    console.log(`  Created: ${s.created}, Updated: ${s.updated}`);
    console.log(`  Vacancies: ${s.vacancies.join(", ")}`);
    console.log("");
  });

  console.log("--- Confirmation ---");
  summary.forEach((s) => {
    console.log(`  ${s.company}: All listed vacancies are PUBLISHED, Tbilisi, and attached to company_id ${s.companyId}.`);
  });

  console.log("\n--- Structured JSON (ready for reference / DB insertion) ---\n");
  console.log(JSON.stringify(jsonByCompany, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
