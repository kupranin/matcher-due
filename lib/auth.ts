/**
 * Password hashing for User registration (bcrypt).
 */

import { hashSync, compareSync } from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): string {
  return hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return compareSync(password, storedHash);
}
