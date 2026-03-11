import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient(
  process.env.DIRECT_URL ? { datasources: { db: { url: process.env.DIRECT_URL } } } : undefined
);

const PASSWORD = "12345678";
const TBILISI_ID = "tbilisi";

type RoleKey =
  | "cashier"
  | "sales_consultant"
  | "barista"
  | "waiter"
  | "warehouse_worker"
  | "cleaner"
  | "receptionist"
  | "admin_assistant"
  | "support_operator"
  | "promoter_merchandiser";

type CandidateSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  willingToRelocate: boolean;
  preferredRole: string;
  desiredPositions: string[];
  workModePreference: string;
  employmentTypePreference: string;
  minSalary: number;
  educationLevel: string;
  experienceMonths: number;
  bio: string;
  hardSkills: string[];
  softSkills: string[];
  languages: string[];
};

const FIRST_NAMES = [
  "Nino",
  "Mariam",
  "Ana",
  "Salome",
  "Tako",
  "Elene",
  "Ketevan",
  "Lika",
  "Natia",
  "Giorgi",
  "Luka",
  "Saba",
  "Nikoloz",
  "Davit",
  "Levan",
  "Beka",
  "Tornike",
  "Irakli",
];

const LAST_NAMES = [
  "Beridze",
  "Kapanadze",
  "Gelashvili",
  "Mchedlidze",
  "Ioseliani",
  "Kiknadze",
  "Japaridze",
  "Abashidze",
  "Chikhladze",
  "Lomidze",
  "Gagua",
  "Kakhidze",
];

const CITY_IDS = ["tbilisi", "batumi", "kutaisi", "rustavi", "gori", "zugdidi", "telavi"];

const ROLE_CONFIG: Record<
  RoleKey,
  {
    preferredRole: string;
    salaryMin: number;
    salaryMax: number;
    hardSkills: string[];
  }
> = {
  cashier: {
    preferredRole: "Cashier",
    salaryMin: 900,
    salaryMax: 1300,
    hardSkills: ["POS systems", "Customer service", "Payment handling"],
  },
  sales_consultant: {
    preferredRole: "Sales Consultant",
    salaryMin: 1100,
    salaryMax: 1700,
    hardSkills: ["Retail sales", "Product presentation", "Customer consultation"],
  },
  barista: {
    preferredRole: "Barista",
    salaryMin: 900,
    salaryMax: 1400,
    hardSkills: ["Coffee preparation", "Customer service"],
  },
  waiter: {
    preferredRole: "Waiter / Waitress",
    salaryMin: 900,
    salaryMax: 1400,
    hardSkills: ["Order taking", "Table service"],
  },
  warehouse_worker: {
    preferredRole: "Warehouse Worker",
    salaryMin: 900,
    salaryMax: 1300,
    hardSkills: ["Inventory handling", "Logistics basics"],
  },
  cleaner: {
    preferredRole: "Cleaner",
    salaryMin: 700,
    salaryMax: 1000,
    hardSkills: ["Cleaning", "Hygiene"],
  },
  receptionist: {
    preferredRole: "Receptionist",
    salaryMin: 1100,
    salaryMax: 1600,
    hardSkills: ["Customer service", "Appointment scheduling"],
  },
  admin_assistant: {
    preferredRole: "Administrative Assistant",
    salaryMin: 1200,
    salaryMax: 1800,
    hardSkills: ["MS Office", "Documentation"],
  },
  support_operator: {
    preferredRole: "Support Operator",
    salaryMin: 1300,
    salaryMax: 2000,
    hardSkills: ["Customer support", "Communication"],
  },
  promoter_merchandiser: {
    preferredRole: "Promoter / Merchandiser",
    salaryMin: 1100,
    salaryMax: 1600,
    hardSkills: ["Product display", "Promotion"],
  },
};

const ROLE_COUNTS: Record<RoleKey, number> = {
  cashier: 8,
  sales_consultant: 8,
  barista: 6,
  waiter: 6,
  warehouse_worker: 5,
  cleaner: 4,
  receptionist: 4,
  admin_assistant: 3,
  support_operator: 3,
  promoter_merchandiser: 3,
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function generatePhone(existing: Set<string>): string {
  let phone = "";
  do {
    const tail = randInt(0, 9999999).toString().padStart(7, "0");
    phone = `+9955${tail}`;
  } while (existing.has(phone));
  existing.add(phone);
  return phone;
}

function generateEmail(first: string, last: string, existing: Set<string>): string {
  const base = `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com`;
  if (!existing.has(base)) {
    existing.add(base);
    return base;
  }
  let i = 2;
  let email = "";
  do {
    email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@gmail.com`;
    i++;
  } while (existing.has(email));
  existing.add(email);
  return email;
}

function generateDateOfBirth(): Date {
  const startYear = 1988;
  const endYear = 2003;
  const year = randInt(startYear, endYear);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  return new Date(year, month, day);
}

function generateExperienceMonths(): number {
  const r = Math.random();
  if (r < 0.4) {
    return randInt(0, 6); // 0–6 months
  }
  if (r < 0.8) {
    return randInt(7, 18); // 6–18 months
  }
  return randInt(19, 36); // 18–36 months
}

function experienceBucket(months: number): "Entry" | "Mid" | "Senior" {
  if (months <= 6) return "Entry";
  if (months <= 18) return "Mid";
  return "Mid";
}

function generateCity(): string {
  const r = Math.random();
  if (r < 0.7) return TBILISI_ID;
  return pick(CITY_IDS.filter((id) => id !== TBILISI_ID));
}

function generateSoftSkills(role: RoleKey): string[] {
  switch (role) {
    case "cashier":
      return ["Accuracy", "Responsibility", "Communication"];
    case "sales_consultant":
      return ["Communication", "Persuasion", "Friendliness"];
    case "barista":
      return ["Friendliness", "Speed", "Communication"];
    case "waiter":
      return ["Multitasking", "Communication", "Teamwork"];
    case "warehouse_worker":
      return ["Discipline", "Physical stamina", "Reliability"];
    case "cleaner":
      return ["Discipline", "Reliability"];
    case "receptionist":
      return ["Politeness", "Organization", "Communication"];
    case "admin_assistant":
      return ["Organization", "Attention to detail", "Time management"];
    case "support_operator":
      return ["Patience", "Problem solving", "Empathy"];
    case "promoter_merchandiser":
      return ["Communication", "Outgoing", "Attention to detail"];
  }
}

function buildCandidateSeeds(): CandidateSeed[] {
  const emailSet = new Set<string>();
  const phoneSet = new Set<string>();
  const seeds: CandidateSeed[] = [];

  const roleEntries = Object.entries(ROLE_COUNTS) as [RoleKey, number][];

  for (const [roleKey, count] of roleEntries) {
    const cfg = ROLE_CONFIG[roleKey];
    for (let i = 0; i < count; i++) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const email = generateEmail(firstName, lastName, emailSet);
      const phone = generatePhone(phoneSet);
      const city = generateCity();
      const willingToRelocate = Math.random() < 0.5;
      const experienceMonths = generateExperienceMonths();
      const seniority = experienceBucket(experienceMonths);
      const baseMin = cfg.salaryMin;
      const baseMax = cfg.salaryMax;
      const minSalary =
        seniority === "Entry"
          ? baseMin
          : seniority === "Mid"
          ? Math.round((baseMin + baseMax) / 2)
          : baseMax;

      const hardSkills = cfg.hardSkills;
      const softSkills = generateSoftSkills(roleKey);

      seeds.push({
        firstName,
        lastName,
        email,
        phone,
        city,
        willingToRelocate,
        preferredRole: cfg.preferredRole,
        desiredPositions: [cfg.preferredRole],
        workModePreference: "On-site",
        employmentTypePreference: "Full-time",
        minSalary,
        educationLevel: "High School",
        experienceMonths,
        bio: `${cfg.preferredRole} with ${experienceMonths} months of experience in ${city}.`,
        hardSkills,
        softSkills,
        languages: ["Georgian", "English (basic)"],
      });
    }
  }

  return seeds;
}

async function main() {
  console.log("Connecting to database...");
  await prisma.$connect();

  const seeds = buildCandidateSeeds();
  if (seeds.length !== 50) {
    throw new Error(`Expected 50 seeds, got ${seeds.length}`);
  }

  const passwordHash = hashPassword(PASSWORD);

  let inserted = 0;
  let failed = 0;
  const previews: any[] = [];

  for (const seed of seeds) {
    try {
      const user = await prisma.user.upsert({
        where: { email: seed.email },
        update: { passwordHash },
        create: { email: seed.email, passwordHash, role: "CANDIDATE" },
      });

      const profile = await prisma.candidateProfile.upsert({
        where: { userId: user.id },
        update: {
          phone: seed.phone,
          locationCityId: seed.city,
          availableToWork: true,
          salaryMin: seed.minSalary,
          willingToRelocate: seed.willingToRelocate,
          experienceMonths: seed.experienceMonths,
          experienceText: `seed:batch1 | role=${seed.preferredRole}`,
          educationLevel: seed.educationLevel,
          workTypes: ["Full-time"],
          photo: null,
          jobTitle: seed.preferredRole,
        },
        create: {
          userId: user.id,
          fullName: `${seed.firstName} ${seed.lastName}`,
          phone: seed.phone,
          locationCityId: seed.city,
          availableToWork: true,
          salaryMin: seed.minSalary,
          willingToRelocate: seed.willingToRelocate,
          experienceMonths: seed.experienceMonths,
          experienceText: `seed:batch1 | role=${seed.preferredRole}`,
          educationLevel: seed.educationLevel,
          workTypes: ["Full-time"],
          photo: null,
          jobTitle: seed.preferredRole,
        },
      });

      const skills = [...seed.hardSkills, ...seed.softSkills, ...seed.languages];

      await prisma.candidateSkill.createMany({
        data: skills.map((name) => ({
          candidateProfileId: profile.id,
          name,
          level: "Intermediate",
        })),
      });

      inserted++;

      if (previews.length < 5) {
        previews.push({
          firstName: seed.firstName,
          lastName: seed.lastName,
          email: seed.email,
          phone: seed.phone,
          city: seed.city,
          willingToRelocate: seed.willingToRelocate,
          availableToWork: true,
          preferredRole: seed.preferredRole,
          desiredPositions: seed.desiredPositions,
          workModePreference: seed.workModePreference,
          employmentTypePreference: seed.employmentTypePreference,
          minSalary: seed.minSalary,
          educationLevel: seed.educationLevel,
          experienceMonths: seed.experienceMonths,
          bio: seed.bio,
          hardSkills: seed.hardSkills,
          softSkills: seed.softSkills,
          languages: seed.languages,
          candidatePhoto: null,
          source: "seed",
        });
      }
    } catch (e) {
      console.error("Failed to insert candidate", seed.email, e);
      failed++;
    }
  }

  const totalSeeded = await prisma.candidateProfile.count({
    where: { experienceText: { startsWith: "seed:batch1" } },
  });

  console.log("\n--- Batch 1 Summary ---");
  console.log("Inserted candidates:", inserted);
  console.log("Failed inserts:", failed);
  console.log("Total seeded candidates (batch1 marker):", totalSeeded);
  console.log("\nPreview of first 5 candidates:");
  console.log(JSON.stringify(previews, null, 2));

  // Create demo matches for the first 20 seeded candidates with the earliest vacancy.
  const firstVacancy = await prisma.vacancy.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (firstVacancy) {
    const seedCandidates = await prisma.candidateProfile.findMany({
      where: { experienceText: { startsWith: "seed:batch1" } },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { id: true },
    });

    for (const c of seedCandidates) {
      await prisma.match.upsert({
        where: {
          vacancyId_candidateProfileId: {
            vacancyId: firstVacancy.id,
            candidateProfileId: c.id,
          },
        },
        update: {
          employerLiked: true,
          candidateLiked: true,
        },
        create: {
          vacancyId: firstVacancy.id,
          candidateProfileId: c.id,
          employerLiked: true,
          candidateLiked: true,
        },
      });
    }

    console.log(`Created demo matches for ${seedCandidates.length} seeded candidates with vacancy ${firstVacancy.id}`);
  } else {
    console.log("No vacancies found, skipping demo match creation.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

