-- Run this once in Supabase SQL Editor if your app table is still named "User".
-- Then add @@map("users") to the User model in schema.prisma and run: npx prisma generate
-- This renames the table so it appears as "users" in Table Editor (easier to find).

ALTER TABLE "User" RENAME TO users;
