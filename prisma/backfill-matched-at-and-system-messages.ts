/**
 * One-time backfill: for every match where employer_liked AND candidate_liked are true
 * and matched_at is null, set matched_at = now(). Also inserts the system chat message 
 * if none exists for that match.
 *
 * Run: npx tsx prisma/backfill-matched-at-and-system-messages.ts
 * (Loads .env so DATABASE_URL is set; URL must start with postgres:// or postgresql://)
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const MATCH_SYSTEM_MESSAGE_TEXT = "You matched! Say hi 👋";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    console.error(
      "DATABASE_URL must start with postgres:// or postgresql://. Check your .env file in the project root."
    );
    process.exit(1);
  }
  const prisma = new PrismaClient();

  try {
    const res1 = await prisma.$executeRawUnsafe(`
      UPDATE public.matches
      SET matched_at = now()
      WHERE employer_liked = true
        AND candidate_liked = true
        AND matched_at IS NULL;
    `);
    console.log(`Updated matched_at for ${res1} existing matches.`);

    const res2 = await prisma.$executeRawUnsafe(`
      INSERT INTO public.chat_messages (id, match_id, sender, text, created_at)
      SELECT
        gen_random_uuid()::text,
        m.id,
        'system',
        '${MATCH_SYSTEM_MESSAGE_TEXT}',
        now()
      FROM public.matches m
      WHERE m.employer_liked = true
        AND m.candidate_liked = true
        AND NOT EXISTS (
          SELECT 1
          FROM public.chat_messages cm
          WHERE cm.match_id = m.id
        );
    `);
    console.log(`Inserted ${res2} system chat messages for existing matches.`);
  } catch (err) {
    console.error("Backfill failed:", err);
  }

  console.log("Backfill done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
