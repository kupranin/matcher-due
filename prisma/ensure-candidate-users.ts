/**
 * Ensure every candidate has a User account they can log in with.
 * - Finds all CandidateProfiles (and their User).
 * - For any User that has no or invalid password, sets password to 12345678.
 * - Ensures role is CANDIDATE.
 *
 * Run: npx tsx prisma/ensure-candidate-users.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient(
  process.env.DIRECT_URL || process.env.DATABASE_URL
    ? {
        datasources: {
          db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
        },
      }
    : undefined
);

const PASSWORD = "12345678";

async function main() {
  const passwordHash = hashPassword(PASSWORD);

  const profiles = await prisma.candidateProfile.findMany({
    include: { user: true },
  });

  console.log(`Found ${profiles.length} candidate profile(s).`);

  let updated = 0;
  let skipped = 0;

  for (const profile of profiles) {
    const user = profile.user;
    const needsPassword = !user.passwordHash || user.passwordHash.length < 10;
    const needsRole = user.role !== "CANDIDATE";

    if (needsPassword || needsRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(needsPassword && { passwordHash }),
          ...(needsRole && { role: "CANDIDATE" }),
        },
      });
      updated++;
      if (updated <= 5 || updated % 100 === 0) {
        console.log(`  Updated user ${user.email} (profile: ${profile.fullName})`);
      }
    } else {
      skipped++;
    }
  }

  console.log(`Done. Updated ${updated} user(s), ${skipped} already had valid login.`);
  if (updated > 0) {
    console.log(`Password for updated accounts: ${PASSWORD}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
