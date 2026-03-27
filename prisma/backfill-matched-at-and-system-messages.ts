/**
 * One-time backfill: for every match where employer_liked AND candidate_liked are true
 * and matched_at is null, set matched_at = now() and insert one system chat message
 * so the chat thread exists and both sides see it.
 *
 * Run: npx tsx prisma/backfill-matched-at-and-system-messages.ts
 * (Loads .env so DATABASE_URL is set; URL must start with postgres:// or postgresql://)
 *
 * Requires: matched_at column must exist. Run `npx prisma db push` first if you see a validation error.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { MATCH_SYSTEM_MESSAGE_TEXT } from "../lib/matchSystemMessage";

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    console.error(
      "DATABASE_URL must start with postgres:// or postgresql://. Check your .env file in the project root."
    );
    process.exit(1);
  }
  const prisma = new PrismaClient();

  // Raw SQL to avoid Prisma client validation issues (e.g. stale client or matched_at not in schema)
  let mutualWithoutMatchedAt: { id: string }[];
  try {
    mutualWithoutMatchedAt = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM matches
      WHERE employer_liked = true AND candidate_liked = true AND matched_at IS NULL
    `;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("matched_at") || msg.includes("column") || msg.includes("does not exist")) {
      console.error(
        "The database is missing the matched_at column. Run:\n  npx prisma db push\nThen run this script again."
      );
    }
    console.error("Full error:", err);
    throw err;
  }
  console.log(`Found ${mutualWithoutMatchedAt.length} mutual matches without matched_at`);
  for (const m of mutualWithoutMatchedAt) {
    const existing = await prisma.chatMessage.findFirst({
      where: { matchId: m.id, sender: "system" },
    });
    await prisma.match.update({
      where: { id: m.id },
      data: { matchedAt: new Date() },
    });
    if (!existing) {
      await prisma.chatMessage.create({
        data: { matchId: m.id, sender: "system", text: MATCH_SYSTEM_MESSAGE_TEXT },
      });
    }
    console.log(`  match ${m.id}: set matched_at${existing ? "" : ", inserted system message"}`);
  }
  console.log("Backfill done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
