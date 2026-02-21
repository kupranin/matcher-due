/**
 * Check if users exist in the DB and verify we're talking to the right Supabase project.
 * Run from project root: npx tsx prisma/check-users.ts
 */

import * as path from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("No DIRECT_URL or DATABASE_URL in .env");
    process.exit(1);
  }

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  const projectMatch = dbUrl.match(/postgres\.([a-z0-9]+)\./);
  const projectId = projectMatch ? projectMatch[1] : "?";
  const host = dbUrl.replace(/^[^@]+@/, "").split("/")[0].split("?")[0];

  console.log("--- Database connection ---");
  console.log("Host:", host);
  console.log("Supabase project ref (in URL):", projectId);
  console.log("In Supabase dashboard, your project URL should contain:", projectId);
  console.log("");

  try {
    await prisma.$connect();
    console.log("Connected to database.");
  } catch (e) {
    console.error("Connection failed:", (e as Error).message);
    process.exit(1);
  }

  // List tables in public schema (Postgres)
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log("Tables in schema 'public':", tables.map((t) => t.tablename).join(", ") || "(none)");
  console.log("");

  const count = await prisma.user.count();
  console.log("User count (table 'users'):", count);

  if (count === 0) {
    console.log("");
    console.log("No users found. Adding one test user to verify writes...");
    try {
      await prisma.user.create({
        data: {
          email: "test-check@matcher.ge",
          passwordHash: hashPassword("12345678"),
          role: "EMPLOYER",
        },
      });
      console.log("Created test user: test-check@matcher.ge / password: 12345678");
      const after = await prisma.user.count();
      console.log("User count after insert:", after);
    } catch (err) {
      console.error("Insert failed:", (err as Error).message);
    }
  } else {
    const sample = await prisma.user.findMany({ take: 5, select: { email: true, role: true } });
    console.log("Sample emails:", sample.map((u) => u.email).join(", "));
  }

  await prisma.$disconnect();
  console.log("");
  console.log("In Supabase: Table Editor -> open table 'users'. Same project as above.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
