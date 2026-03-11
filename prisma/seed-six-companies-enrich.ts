/**
 * Seed and enrich 6 existing companies: PSP, Coffee Lab, SKA, Silknet, Elite Electronics, Bata.
 * - Finds each company by name (no new companies created).
 * - Optionally enriches contactEmail, contactPhone, companyId only when confidently verified from public sources.
 * - Sets company account password to: 12345678
 * - Adds listed vacancies (PUBLISHED, Tbilisi).
 *
 * Run: npx tsx prisma/seed-six-companies-enrich.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const TBILISI_ID = "tbilisi";
const PASSWORD = "12345678";

type VerifiedContact = {
  contactEmail?: string | null;
  contactPhone?: string | null;
  companyId?: string | null; // tax/identification number
  sourceNote?: string;
};

type VacancyDef = {
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

function companyMatches(name: string, matchList: string[]): boolean {
  const lower = name.toLowerCase().trim();
  return matchList.some((m) => lower === m || lower.includes(m));
}

// ——— PSP (Pharmacy / healthcare retail) ———
// Contact: info@psp.ge, +995 322 402 020 (public directories e.g. map24.ge). companyId: not confidently verified.
const PSP_CONTACT: VerifiedContact = {
  contactEmail: "info@psp.ge",
  contactPhone: "+995 322 402 020",
  companyId: undefined,
  sourceNote: "Public directories (e.g. map24.ge). companyId not confidently verified.",
};
const PSP_VACANCIES: VacancyDef[] = [
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain cleanliness of retail spaces; follow hygiene standards; support store hygiene procedures.",
    requiredSkills: [
      { name: "Hygiene maintenance", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
      { name: "Attention to detail", level: "Intermediate", weight: 4 },
    ],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Organize goods in warehouse; load and unload deliveries; maintain inventory order.",
    requiredSkills: [
      { name: "Inventory handling", level: "Intermediate", weight: 5 },
      { name: "Physical stamina", level: "Intermediate", weight: 5 },
      { name: "Teamwork", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Administrative Assistant",
    salaryMin: 1200,
    salaryMax: 1700,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Administrative support; documentation; scheduling; internal communication; organization.",
    requiredSkills: [
      { name: "MS Office", level: "Intermediate", weight: 5 },
      { name: "Documentation", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Organization", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Coffee Lab (Coffee shop / hospitality) ———
// Contact: no single official public email found; branch phones only. Not overwriting existing.
const COFFEE_LAB_CONTACT: VerifiedContact = {
  contactEmail: undefined,
  contactPhone: undefined,
  companyId: undefined,
  sourceNote: "Official contact not confidently verified (branch phones only from directories). Left unchanged.",
};
const COFFEE_LAB_VACANCIES: VacancyDef[] = [
  {
    title: "Barista",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Prepare coffee and beverages; operate coffee machines; serve customers; maintain bar area.",
    requiredSkills: [
      { name: "Coffee preparation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Multitasking", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Waitress",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Serve customers; take orders; deliver orders; maintain cleanliness of service area. Salary + tips.",
    requiredSkills: [
      { name: "Service", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
      { name: "Order taking", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— SKA (Coffee shop / hospitality) ———
// Contact: +995-322040428 from directory. Email not confidently verified.
const SKA_CONTACT: VerifiedContact = {
  contactEmail: undefined,
  contactPhone: "+995 322 040 428",
  companyId: undefined,
  sourceNote: "Phone from public directory. Email and companyId not confidently verified.",
};
const SKA_VACANCIES: VacancyDef[] = [
  {
    title: "Barista",
    salaryMin: 1100,
    salaryMax: 1500,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Prepare coffee and beverages; serve customers; maintain cleanliness of bar area.",
    requiredSkills: [
      { name: "Coffee preparation", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain cleanliness of café and seating areas; ensure hygiene standards.",
    requiredSkills: [
      { name: "Hygiene", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
  },
];

// ——— Silknet (Telecommunications) ———
// Contact: contact@silknet.com, (+995 32) 2 10 00 00 from official site / silknet.com
const SILKNET_CONTACT: VerifiedContact = {
  contactEmail: "contact@silknet.com",
  contactPhone: "+995 32 2 10 00 00",
  companyId: undefined,
  sourceNote: "Official website silknet.com. companyId not confidently verified.",
};
const SILKNET_VACANCIES: VacancyDef[] = [
  {
    title: "Support Operator",
    salaryMin: 1500,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Customer support; resolve queries; assist with services; use CRM/helpdesk tools.",
    requiredSkills: [
      { name: "Customer support", level: "Intermediate", weight: 5 },
      { name: "Problem solving", level: "Intermediate", weight: 5 },
      { name: "CRM/helpdesk usage", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Store Manager",
    salaryMin: 2200,
    salaryMax: 3000,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Manage store operations; lead team; reporting; retail operations.",
    requiredSkills: [
      { name: "Team management", level: "Advanced", weight: 5 },
      { name: "Retail operations", level: "Intermediate", weight: 5 },
      { name: "Reporting", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Consultant",
    salaryMin: 1400,
    salaryMax: 2000,
    workType: "Full-time",
    requiredExperienceMonths: 12,
    requiredEducationLevel: "High School",
    description: "Customer consultation; explain telecom products and plans; sales basics.",
    requiredSkills: [
      { name: "Customer consultation", level: "Intermediate", weight: 5 },
      { name: "Telecom product knowledge", level: "Intermediate", weight: 5 },
      { name: "Sales basics", level: "Intermediate", weight: 4 },
    ],
  },
];

// ——— Elite Electronics (Electronics retail) ———
// Contact: +995 322 48 48 48 from directories. Email not confidently verified.
const ELITE_ELECTRONICS_CONTACT: VerifiedContact = {
  contactEmail: undefined,
  contactPhone: "+995 322 48 48 48",
  companyId: undefined,
  sourceNote: "Phone from public directories (e.g. georgiayp.com, near-place). Email and companyId not confidently verified.",
};
const ELITE_ELECTRONICS_VACANCIES: VacancyDef[] = [
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
      { name: "Accuracy", level: "Intermediate", weight: 5 },
      { name: "Customer service", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Cleaner",
    salaryMin: 800,
    salaryMax: 1000,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Maintain store cleanliness; hygiene standards.",
    requiredSkills: [
      { name: "Hygiene", level: "Intermediate", weight: 5 },
      { name: "Reliability", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Warehouse Worker",
    salaryMin: 1000,
    salaryMax: 1400,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Inventory handling; receive and ship goods; warehouse operations.",
    requiredSkills: [
      { name: "Inventory handling", level: "Intermediate", weight: 5 },
      { name: "Logistics basics", level: "Intermediate", weight: 5 },
    ],
  },
  {
    title: "Brand Manager",
    salaryMin: 2200,
    salaryMax: 3000,
    workType: "Full-time",
    requiredExperienceMonths: 36,
    requiredEducationLevel: "Bachelor",
    description: "Manage brand in store; coordinate marketing; analyze sales; cooperate with suppliers.",
    requiredSkills: [
      { name: "Brand management", level: "Advanced", weight: 5 },
      { name: "Marketing", level: "Intermediate", weight: 5 },
      { name: "Retail analytics", level: "Intermediate", weight: 5 },
    ],
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
    ],
  },
];

// ——— Bata (Footwear / fashion retail) ———
// Contact: info@bats.ge, (+995 422) 24 22 22 from web.bats.ge
const BATA_CONTACT: VerifiedContact = {
  contactEmail: "info@bats.ge",
  contactPhone: "+995 422 24 22 22",
  companyId: undefined,
  sourceNote: "Bata Georgia site (web.bats.ge). companyId not confidently verified.",
};
const BATA_VACANCIES: VacancyDef[] = [
  {
    title: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1600,
    workType: "Full-time",
    requiredExperienceMonths: 0,
    requiredEducationLevel: "None",
    description: "Retail sales; customer service; product presentation; communication.",
    requiredSkills: [
      { name: "Customer service", level: "Intermediate", weight: 5 },
      { name: "Retail sales", level: "Intermediate", weight: 5 },
      { name: "Product presentation", level: "Intermediate", weight: 5 },
      { name: "Communication", level: "Intermediate", weight: 5 },
    ],
  },
];

const CONFIG: Array<{
  nameMatch: string[];
  label: string;
  verifiedContact: VerifiedContact;
  vacancies: VacancyDef[];
}> = [
  { nameMatch: ["psp"], label: "PSP", verifiedContact: PSP_CONTACT, vacancies: PSP_VACANCIES },
  { nameMatch: ["coffee lab", "coffeelab"], label: "Coffee Lab", verifiedContact: COFFEE_LAB_CONTACT, vacancies: COFFEE_LAB_VACANCIES },
  { nameMatch: ["ska"], label: "SKA", verifiedContact: SKA_CONTACT, vacancies: SKA_VACANCIES },
  { nameMatch: ["silknet"], label: "Silknet", verifiedContact: SILKNET_CONTACT, vacancies: SILKNET_VACANCIES },
  { nameMatch: ["elite electronics", "elit electronics", "elit electroncs"], label: "Elite Electronics", verifiedContact: ELITE_ELECTRONICS_CONTACT, vacancies: ELITE_ELECTRONICS_VACANCIES },
  { nameMatch: ["bata"], label: "Bata", verifiedContact: BATA_CONTACT, vacancies: BATA_VACANCIES },
];

async function ensureVacancy(
  companyId: string,
  v: VacancyDef
): Promise<{ id: string; title: string; created: boolean }> {
  const existing = await prisma.vacancy.findFirst({
    where: { companyId, title: v.title },
    select: { id: true },
  });

  if (existing) {
    await prisma.vacancy.update({
      where: { id: existing.id },
      data: { salaryMin: v.salaryMin, salaryMax: v.salaryMax },
    });
    return { id: existing.id, title: v.title, created: false };
  }

  const vacancy = await prisma.vacancy.create({
    data: {
      companyId,
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

  return { id: vacancy.id, title: vacancy.title, created: true };
}

async function main() {
  console.log("Connecting to database...\n");
  await prisma.$connect();

  const allCompanies = await prisma.company.findMany({
    include: { user: { select: { id: true, email: true } } },
  });

  const passwordHash = hashPassword(PASSWORD);
  const results: Array<{
    label: string;
    match: boolean;
    companyId: string | null;
    companyName: string | null;
    contactBefore: { email: string; phone: string; companyId: string } | null;
    contactUpdated: Partial<{ contactEmail: string; contactPhone: string; companyId: string }>;
    passwordSet: boolean;
    vacanciesAdded: Array<{ title: string; id: string; created: boolean }>;
    notes: string[];
  }> = [];

  for (const cfg of CONFIG) {
    const company = allCompanies.find((c) => companyMatches(c.name, cfg.nameMatch));
    const notes: string[] = [cfg.verifiedContact.sourceNote ?? ""].filter(Boolean);
    if (!cfg.verifiedContact.contactEmail && !cfg.verifiedContact.contactPhone && !cfg.verifiedContact.companyId) {
      notes.push("Contact fields: not confidently verified; existing values left unchanged.");
    }
    if (cfg.verifiedContact.companyId == null) {
      notes.push("Company identification number: not confidently verified; not updated.");
    }

    if (!company) {
      results.push({
        label: cfg.label,
        match: false,
        companyId: null,
        companyName: null,
        contactBefore: null,
        contactUpdated: {},
        passwordSet: false,
        vacanciesAdded: [],
        notes: [...notes, "Company not found in database. Add company first."],
      });
      console.log(`  ${cfg.label}: NOT FOUND in database. Skipping.\n`);
      continue;
    }

    const contactBefore = {
      email: company.contactEmail,
      phone: company.contactPhone,
      companyId: company.companyId,
    };

    const contactUpdate: Partial<{ contactEmail: string; contactPhone: string; companyId: string }> = {};
    if (cfg.verifiedContact.contactEmail != null) contactUpdate.contactEmail = cfg.verifiedContact.contactEmail;
    if (cfg.verifiedContact.contactPhone != null) contactUpdate.contactPhone = cfg.verifiedContact.contactPhone;
    if (cfg.verifiedContact.companyId != null) contactUpdate.companyId = cfg.verifiedContact.companyId;

    if (Object.keys(contactUpdate).length > 0) {
      await prisma.company.update({
        where: { id: company.id },
        data: contactUpdate,
      });
    }

    await prisma.user.update({
      where: { id: company.userId },
      data: { passwordHash },
    });

    const vacanciesAdded: Array<{ title: string; id: string; created: boolean }> = [];
    for (const v of cfg.vacancies) {
      const out = await ensureVacancy(company.id, v);
      vacanciesAdded.push({ title: out.title, id: out.id, created: out.created });
      console.log(`    ${out.created ? "Created" : "Updated"}: ${out.title}`);
    }

    results.push({
      label: cfg.label,
      match: true,
      companyId: company.id,
      companyName: company.name,
      contactBefore,
      contactUpdated: contactUpdate,
      passwordSet: true,
      vacanciesAdded,
      notes,
    });

    console.log(`  ${company.name} (id: ${company.id}): contact ${Object.keys(contactUpdate).length ? "updated" : "unchanged"}, password set, ${vacanciesAdded.length} vacancies.\n`);
  }

  console.log("\n========== PER-COMPANY OUTPUT ==========\n");
  results.forEach((r) => {
    console.log(`--- ${r.label} ---`);
    console.log("1. Company match confirmation:", r.match ? `Found (id: ${r.companyId})` : "Not found in DB.");
    console.log("2. Found contact/company details:", r.contactBefore ?? "N/A");
    if (r.match && Object.keys(r.contactUpdated).length) {
      console.log("   Updated with verified:", r.contactUpdated);
    }
    console.log("3. List of added/updated vacancies:", r.vacanciesAdded.length ? r.vacanciesAdded.map((v) => `${v.title} (${v.created ? "created" : "updated"})`).join(", ") : "None.");
    console.log("5. Assumptions or fields not confidently verified:", r.notes.join(" | ") || "None.");
    console.log("");
  });

  console.log("--- Summary ---");
  results.forEach((r) => {
    console.log(`  ${r.label}: ${r.match ? "OK" : "NOT FOUND"} ${r.vacanciesAdded.length ? `| Vacancies: ${r.vacanciesAdded.map((v) => v.title).join(", ")}` : ""}`);
  });

  console.log("\n--- 4. Structured JSON (ready for insertion/update) ---");
  const jsonOut = results.map((r) => ({
    company_match: r.match,
    company_id: r.companyId,
    company_name: r.companyName,
    contact_before: r.contactBefore,
    contact_updated: r.contactUpdated,
    password_set: r.passwordSet ? "12345678" : null,
    vacancies: r.vacanciesAdded.map((v) => ({
      title: v.title,
      id: v.id,
      created: v.created,
      city: TBILISI_ID,
      employmentType: "Full-time",
      workMode: "on-site",
      status: "active",
      isPublic: true,
    })),
    assumptions_or_not_verified: r.notes,
  }));
  console.log(JSON.stringify(jsonOut, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
