/**
 * Persist user-added skills and job roles to the database.
 */

export async function addSkillToDb(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  try {
    await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
  } catch {
    // Ignore; skill still works in UI
  }
}

export type CreateJobRoleInput = {
  title: string;
  locale?: "en" | "ka";
  category?: string;
  description?: string;
  skills?: { skillName: string; weight: number }[];
};

export type JobTemplateRole = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  skills: { skillName: string; weight: number }[];
};

export async function createJobRoleInDb(input: CreateJobRoleInput): Promise<JobTemplateRole | null> {
  try {
    const res = await fetch("/api/job-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title.trim(),
        locale: input.locale ?? "en",
        category: input.category ?? "User-added",
        description: input.description ?? "",
        skills: input.skills ?? [],
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
