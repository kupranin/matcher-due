export function calculateAge(dateOfBirth: string | Date | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob =
    typeof dateOfBirth === "string"
      ? new Date(dateOfBirth)
      : dateOfBirth;
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  // Basic future check
  if (dob > now) return null;

  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }

  if (!Number.isFinite(age)) return null;
  if (age < 0) return null;

  return age;
}

