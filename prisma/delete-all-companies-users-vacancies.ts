/**
 * Delete all companies, users, and vacancies (and dependent data).
 * Order respects foreign keys: chat → match → vacancy_skill, vacancy → subscription, purchase, company
 * → candidate_skill, candidate_profile → session, password_reset_token → user.
 *
 * Run: npm run db:delete-all
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

async function main() {
  await prisma.$connect();

  const chat = await prisma.chatMessage.deleteMany({});
  console.log("Deleted ChatMessage:", chat.count);

  const match = await prisma.match.deleteMany({});
  console.log("Deleted Match:", match.count);

  const vacancySkill = await prisma.vacancySkill.deleteMany({});
  console.log("Deleted VacancySkill:", vacancySkill.count);

  const vacancy = await prisma.vacancy.deleteMany({});
  console.log("Deleted Vacancy:", vacancy.count);

  const subscription = await prisma.subscription.deleteMany({});
  console.log("Deleted Subscription:", subscription.count);

  const purchase = await prisma.purchase.deleteMany({});
  console.log("Deleted Purchase:", purchase.count);

  const company = await prisma.company.deleteMany({});
  console.log("Deleted Company:", company.count);

  const candidateSkill = await prisma.candidateSkill.deleteMany({});
  console.log("Deleted CandidateSkill:", candidateSkill.count);

  const candidateProfile = await prisma.candidateProfile.deleteMany({});
  console.log("Deleted CandidateProfile:", candidateProfile.count);

  const passwordResetToken = await prisma.passwordResetToken.deleteMany({});
  console.log("Deleted PasswordResetToken:", passwordResetToken.count);

  const session = await prisma.session.deleteMany({});
  console.log("Deleted Session:", session.count);

  const user = await prisma.user.deleteMany({});
  console.log("Deleted User:", user.count);

  console.log("Done. All companies, users, and vacancies (and related data) have been removed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
