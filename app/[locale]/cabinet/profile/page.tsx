"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  loadCandidateProfile,
  saveCandidateProfile,
  buildProfileFromProfilePage,
  getCandidateUserId,
  parseExperienceMonths,
} from "@/lib/candidateProfileStorage";
import { GEORGIAN_CITIES } from "@/lib/georgianLocations";
import { addSkillToDb } from "@/lib/userContentApi";
import { ALL_SKILLS } from "@/lib/allSkills";

const WORK_TYPES = ["Full-time", "Part-time", "Temporary", "Remote"];
const JOB_SUGGESTIONS = [
  "Barista", "Cashier", "Waiter/Waitress", "Sales Associate", "Call Center Agent",
  "Warehouse Worker", "Receptionist", "Delivery Courier", "Kitchen Assistant",
  "Cleaner", "Security Guard", "Pharmacy Assistant", "Hotel Housekeeping",
  "Retail Merchandiser", "Junior Accountant", "Office Assistant",
  "Bartender", "Chef / Line Cook", "Data Entry Clerk", "Driver", "Hotel Front Desk Agent",
  "Nanny / Childcare", "Stock Associate", "Restaurant Host", "Construction Laborer",
  "Event Staff", "Laundry Worker", "Handyman", "Teaching Assistant",
];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type SkillLevel = (typeof SKILL_LEVELS)[number];

export default function CabinetProfilePage() {
  const t = useTranslations("profile");
  const tSkillNames = useTranslations("skillNames");
  const skillLabel = (s: string) => (ALL_SKILLS.includes(s) ? (tSkillNames(s) as string) : s);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [job, setJob] = useState("");
  const [location, setLocation] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [skills, setSkills] = useState<{ name: string; level: SkillLevel }[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>("Intermediate");
  const [salary, setSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [languages, setLanguages] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = loadCandidateProfile();
    if (!stored) return;
    setFullName(stored.fullName ?? "");
    setEmail(stored.email ?? "");
    setPhone(stored.phone ?? "");
    setBio(stored.bio ?? "");
    setJob(stored.job ?? "");
    setLinkedIn(stored.linkedIn ?? "");
    setLanguages(stored.languages ?? "");
    const p = stored.profile;
    if (p) {
      setLocation("locationCityId" in p && p.locationCityId ? (GEORGIAN_CITIES.find((c) => c.id === p.locationCityId)?.nameEn ?? p.locationCityId) : "");
      setWillingToRelocate("willingToRelocate" in p ? Boolean(p.willingToRelocate) : false);
      setSalary(String(p.salaryMin || ""));
      setExperience(p.experienceMonths ? String(p.experienceMonths) + " months" : "");
      setWorkTypes(p.workTypes ?? []);
      setSkills(
        (p.skills ?? []).map((s) => ({ name: s.name, level: s.level ?? "Intermediate" }))
      );
    }
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  }

  function addSkill() {
    const name = newSkillName.trim();
    if (!name || skills.length >= 10) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkills((prev) => [...prev, { name, level: newSkillLevel }]);
    setNewSkillName("");
    addSkillToDb(name);
  }

  function removeSkill(name: string) {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  }

  function toggleWorkType(w: string) {
    setWorkTypes((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
    );
  }

  const [showAddSkillInput, setShowAddSkillInput] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{t("title")}</h1>
      <p className="mt-1 text-gray-600">{t("subtitle")}</p>

      <div className="mt-8 space-y-6">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("photo")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("photoHint")}</p>
          <div className="mt-4 flex items-center gap-6">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-gray-400">👤</div>
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                {photoUrl ? t("changePhoto") : t("addPhoto")}
              </button>
              {photoUrl && <button type="button" onClick={() => setPhotoUrl(null)} className="ml-2 text-sm text-gray-500 hover:text-red-600">{t("remove")}</button>}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("basicInfo")}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("fullName")}</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("fullNamePlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("aboutMe")}</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("aboutMePlaceholder")} rows={3} maxLength={300} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
              <p className="mt-1 text-xs text-gray-500">{bio.length}/300</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("jobAndLocation")}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("jobLookingFor")}</label>
              <input value={job} onChange={(e) => setJob(e.target.value)} placeholder={t("jobPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
              <div className="mt-2 flex flex-wrap gap-2">
                {JOB_SUGGESTIONS.slice(0, 6).map((j) => (
                  <button key={j} type="button" onClick={() => setJob(j)} className={`rounded-full border px-3 py-1 text-xs ${job === j ? "border-matcher bg-matcher-mint" : "border-gray-200 hover:bg-gray-50"}`}>{j}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("locationCity")}</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("locationPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="willingToRelocate"
                checked={willingToRelocate}
                onChange={(e) => setWillingToRelocate(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-matcher focus:ring-matcher/30"
              />
              <label htmlFor="willingToRelocate" className="text-sm font-medium text-gray-900">{t("willingToRelocate")}</label>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("workType")}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {WORK_TYPES.map((w) => (
                  <button key={w} type="button" onClick={() => toggleWorkType(w)} className={`rounded-full border px-3 py-1.5 text-xs ${workTypes.includes(w) ? "border-matcher bg-matcher-mint" : "border-gray-200 hover:bg-gray-50"}`}>{w}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("expectedSalary")}</label>
              <input type="text" inputMode="numeric" value={salary} onChange={(e) => setSalary(e.target.value.replace(/[^\d]/g, ""))} placeholder={t("salaryPlaceholder")} className="mt-2 w-full max-w-[200px] rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("experience")}</h2>
          <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder={t("experiencePlaceholder")} rows={3} maxLength={500} className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
          <p className="mt-1 text-xs text-gray-500">{experience.length}/500</p>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("skills")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("skillsHint")}</p>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {skills.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1 rounded-full border border-matcher bg-matcher-mint px-3 py-1 text-sm">
                {skillLabel(s.name)} ({s.level})
                <button type="button" onClick={() => removeSkill(s.name)} className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-red-100 hover:text-red-600">×</button>
              </span>
            ))}
            {skills.length < 10 && !showAddSkillInput && (
              <button
                type="button"
                onClick={() => setShowAddSkillInput(true)}
                className="inline-flex items-center gap-1 rounded-full border-2 border-dashed border-matcher-teal bg-matcher-teal/10 px-3 py-1.5 text-sm font-medium text-matcher-teal hover:bg-matcher-teal/20 hover:border-matcher-teal"
              >
                + {t("addSkill")}
              </button>
            )}
            {skills.length < 10 && showAddSkillInput && (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-matcher bg-matcher-pale px-3 py-2">
                <input value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(), setShowAddSkillInput(false))} placeholder={t("skillPlaceholder")} className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-matcher/30 w-36" />
                <select value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)} className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-matcher/30">
                  {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <button type="button" onClick={() => { addSkill(); setShowAddSkillInput(false); }} className="rounded-xl border border-matcher px-3 py-1.5 text-sm font-medium text-matcher-dark hover:bg-matcher-mint">{t("add")}</button>
                <button type="button" onClick={() => setShowAddSkillInput(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t("contact")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("contactHint")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("phone")}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phonePlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-900">{t("linkedInOptional")}</label>
              <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder={t("linkedInPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{t("languagesOptional")}</label>
              <input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder={t("languagesPlaceholder")} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30" />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={async () => {
            const profile = buildProfileFromProfilePage({
              location,
              salary,
              experience,
              skills,
              workTypes,
              willingToRelocate,
            });
            saveCandidateProfile({
              profile,
              fullName: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              bio: bio.trim() || undefined,
              job: job.trim() || undefined,
              linkedIn: linkedIn.trim() || undefined,
              languages: languages.trim() || undefined,
            });
            const userId = getCandidateUserId();
            if (userId) {
              const locationCityId = GEORGIAN_CITIES.find((c) => c.nameEn === location.trim())?.id ?? (location.trim() || "");
              try {
                await fetch("/api/candidates/profile", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId,
                    fullName: fullName.trim(),
                    phone: phone.trim() || undefined,
                    locationCityId: locationCityId || undefined,
                    willingToRelocate,
                    salaryMin: Math.max(0, parseInt(salary.replace(/\s/g, ""), 10) || 0) || undefined,
                    experienceMonths: experience.trim() ? parseExperienceMonths(experience) : undefined,
                    experienceText: experience.trim() || undefined,
                    educationLevel: profile.educationLevel,
                    workTypes: workTypes.length ? workTypes : undefined,
                    skills: profile.skills.map((s) => ({ name: s.name, level: s.level })),
                    jobTitle: job.trim() || undefined,
                  }),
                });
              } catch {
                // ignore
              }
            }
            const btn = document.activeElement as HTMLButtonElement;
            const orig = btn?.textContent;
            if (btn) btn.textContent = t("saved");
            setTimeout(() => { if (btn) btn.textContent = orig ?? t("saveProfile"); }, 1500);
          }}
          className="rounded-2xl bg-matcher px-6 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
        >
          {t("saveProfile")}
        </button>
      </div>
    </div>
  );
}
