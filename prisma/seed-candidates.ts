/**
 * Seed candidates only. Run: npm run db:seed:candidates
 * Password for all: password123
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

const PASSWORD = "password123";
const passwordHash = hashSync(PASSWORD, 10);

const CANDIDATES = [
  {
    fullName: "Nino Kapanadze",
    phone: "+995555123456",
    locationCityId: "tbilisi",
    salaryMin: 1100,
    jobTitle: "Barista",
    experienceMonths: 12,
    educationLevel: "High School",
    workTypes: ["Full-time"],
    skills: [
      { name: "Customer service", level: "Intermediate" },
      { name: "Coffee preparation", level: "Intermediate" },
      { name: "Cash handling", level: "Advanced" },
    ],
  },
  {
    fullName: "Giorgi Maisuradze",
    phone: "+995555111222",
    locationCityId: "tbilisi",
    salaryMin: 900,
    jobTitle: "Cashier",
    experienceMonths: 6,
    educationLevel: "High School",
    workTypes: ["Full-time", "Part-time"],
    skills: [
      { name: "Cash handling", level: "Intermediate" },
      { name: "Attention to detail", level: "Intermediate" },
      { name: "Customer service", level: "Intermediate" },
    ],
  },
  {
    fullName: "Mariam Beridze",
    phone: "+995555222333",
    locationCityId: "batumi",
    salaryMin: 1000,
    jobTitle: "Receptionist",
    experienceMonths: 8,
    educationLevel: "High School",
    workTypes: ["Full-time", "Part-time"],
    skills: [
      { name: "Communication", level: "Advanced" },
      { name: "Organization", level: "Intermediate" },
      { name: "MS Office", level: "Intermediate" },
    ],
  },
  {
    fullName: "Davit Kvirkvelia",
    phone: "+995555333444",
    locationCityId: "tbilisi",
    salaryMin: 800,
    jobTitle: "Waiter/Waitress",
    experienceMonths: 4,
    educationLevel: "High School",
    workTypes: ["Full-time", "Part-time"],
    skills: [
      { name: "Customer service", level: "Intermediate" },
      { name: "Communication", level: "Intermediate" },
      { name: "Time management", level: "Beginner" },
    ],
  },
  {
    fullName: "Ana Giorgadze",
    phone: "+995555444555",
    locationCityId: "tbilisi",
    salaryMin: 950,
    jobTitle: "Sales Associate",
    experienceMonths: 10,
    educationLevel: "Bachelor",
    workTypes: ["Full-time"],
    skills: [
      { name: "Communication", level: "Advanced" },
      { name: "Customer service", level: "Intermediate" },
      { name: "Problem solving", level: "Intermediate" },
    ],
  },
];

function generateEmailFromName(fullName: string, used: Set<string>): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  let localPart = base || "candidate";
  let email = `${localPart}@gmail.com`;
  let suffix = 2;
  while (used.has(email)) {
    email = `${localPart}${suffix}@gmail.com`;
    suffix++;
  }
  used.add(email);
  return email;
}

async function main() {
  console.log("Seeding candidates...");
  await prisma.$connect();

  const usedEmails = new Set<string>();

  for (const c of CANDIDATES) {
    const email = generateEmailFromName(c.fullName, usedEmails);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        email,
        passwordHash,
        role: "CANDIDATE",
      },
    });

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: c.fullName,
        phone: c.phone,
        locationCityId: c.locationCityId,
        salaryMin: c.salaryMin,
        willingToRelocate: false,
        experienceMonths: c.experienceMonths,
        educationLevel: c.educationLevel,
        workTypes: c.workTypes,
        jobTitle: c.jobTitle,
      },
    });

    for (const s of c.skills) {
      await prisma.candidateSkill.upsert({
        where: {
          candidateProfileId_name: { candidateProfileId: profile.id, name: s.name },
        },
        update: { level: s.level },
        create: { candidateProfileId: profile.id, name: s.name, level: s.level },
      });
    }
    console.log(`  ${email} (${c.fullName})`);
  }

  console.log(`Done. ${CANDIDATES.length} candidates seeded. Password: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
