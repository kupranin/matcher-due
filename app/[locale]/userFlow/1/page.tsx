"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { useTheme } from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  GEORGIAN_REGIONS,
  GEORGIAN_CITIES,
  type CityId,
  type DistrictId,
} from "@/lib/georgianLocations";
import {
  buildProfileFromUserFlow,
  saveCandidateProfile,
  type StoredCandidateProfile,
} from "@/lib/candidateProfileStorage";
import { fetchJobTemplates, AVG_SALARY_BY_SLUG, getSkillNamesFromRole, type JobTemplateRole } from "@/lib/jobTemplates";
import { resolveJobRoleSlug } from "@/lib/jobRoleSlug";
import { addSkillToDb, createJobRoleInDb } from "@/lib/userContentApi";
import { ALL_SKILLS } from "@/lib/allSkills";
import type { EducationLevel } from "@/lib/matchCalculation";

const GeorgiaMap = dynamic(() => import("./GeorgiaMap"), { ssr: false });

type ExperienceAnswer = "yes" | "no" | null;
type WorkType = "full-time" | "part-time" | "temp" | "remote" | null;

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
type SelectedSkill = { name: string; level?: SkillLevel };

// Growth metaphor: seed → branch → tree (colored, illustration-style)
const SKILL_LEVELS: { value: SkillLevel; label: string; icon: React.ReactNode }[] = [
  {
    value: "Beginner",
    label: "Beginner",
    icon: (
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <ellipse cx="12" cy="8" rx="3.2" ry="4" fill="#c4a574" stroke="#8b6914" strokeWidth="0.8" />
        <path d="M 11 12 L 11 19 M 13 12 L 13 19" stroke="#6b5344" strokeWidth="0.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    icon: (
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M 12 21 L 12 10" stroke="#6b4423" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 12 10 L 8 6" stroke="#6b4423" strokeWidth="1" strokeLinecap="round" />
        <path d="M 12 10 L 16 6" stroke="#6b4423" strokeWidth="1" strokeLinecap="round" />
        <path d="M 12 10 L 10 4" stroke="#6b4423" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="8" cy="5.5" rx="2" ry="2.5" fill="#4a7c59" stroke="#2d5a27" strokeWidth="0.5" />
        <ellipse cx="16" cy="5.5" rx="2" ry="2.5" fill="#5a9c69" stroke="#2d5a27" strokeWidth="0.5" />
        <ellipse cx="10" cy="3" rx="1.2" ry="1.5" fill="#5a9c69" stroke="#2d5a27" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    value: "Advanced",
    label: "Advanced",
    icon: (
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M 10.5 14 H 13.5 V 20 H 10.5 Z"
          fill="#8b6914"
          stroke="#6b5344"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        <path
          d="M 12 3 C 7 3 6 7 6 10 C 6 12 7.5 13.5 10 14 C 10.5 14.5 11 15 11.5 15.5 C 12 15.5 12.5 15 13 14.5 C 15.5 14 17 12 17 10 C 17 7 16 3 12 3 Z"
          fill="#4a7c59"
          stroke="#2d5a27"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
        <path d="M 12 6 C 9 6 9 9 12 9.5 C 15 9 15 6 12 6 Z" fill="#5a9c69" stroke="#2d5a27" strokeWidth="0.4" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// Fallback skills when DB role has none (unlikely)
const FALLBACK_SKILLS = ["Communication", "Teamwork", "Time management"];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function isValidEmail(email: string) {
  // simple MVP validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string) {
  // MVP: allow +, digits, spaces; require >= 9 digits total
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 9;
}

function isValidPassword(password: string) {
  return password.length >= 8;
}

export default function UserFlow1Page() {
  const t = useTranslations("userFlow");
  const tCommon = useTranslations("common");
  const tExtras = useTranslations("userFlowExtras");
  const tSkillNames = useTranslations("skillNames");
  const locale = useLocale();
  const apiLocale = (locale === "local" ? "en" : locale) as "en" | "ka";
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);

  // Job templates from DB
  const [jobRoles, setJobRoles] = useState<JobTemplateRole[]>([]);
  const [jobRolesLoading, setJobRolesLoading] = useState(true);
  const [jobRolesError, setJobRolesError] = useState<string | null>(null);

  useEffect(() => {
    setJobRolesLoading(true);
    setJobRolesError(null);
    fetchJobTemplates(apiLocale)
      .then(setJobRoles)
      .catch((e) => setJobRolesError(e instanceof Error ? e.message : tExtras("failedToLoadJobs")))
      .finally(() => setJobRolesLoading(false));
  }, [locale]);

  // Step 1 — job is slug (e.g. "barista") or "other" for custom title
  const [job, setJob] = useState<string | null>(null);
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [jobListExpanded, setJobListExpanded] = useState(false);

  const selectedRole = useMemo(
    () => (job && job !== "other" ? jobRoles.find((r) => r.slug === job) ?? null : null),
    [job, jobRoles]
  );

  // Step 2
  const [experience, setExperience] = useState<ExperienceAnswer>(null);
  // Represent experience as a simple period (months) instead of free text.
  const [experienceMonthsText, setExperienceMonthsText] = useState("");

  // Step 3
  const [workType, setWorkType] = useState<WorkType>(null);

  // Step 4
  const [skills, setSkills] = useState<SelectedSkill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);

  // Step 5 — location
  const [locationCityId, setLocationCityId] = useState<CityId | null>(null);
  const [locationDistrictId, setLocationDistrictId] = useState<DistrictId | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(false);

  // Step 6 — salary
  const [salary, setSalary] = useState("");
  const [education, setEducation] = useState<EducationLevel>("High School");

  // Extra personal details collected during onboarding
  const [dob, setDob] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");

  // Step 8 — registration (personal info)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // OTP modal
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState<"phone" | "email">("phone");

  // After registration: show success screen then redirect to cabinet
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Salary above recommended → confirm before continuing
  const [salaryConfirmOpen, setSalaryConfirmOpen] = useState(false);

  const suggestedSkills = useMemo(() => {
    const names = getSkillNamesFromRole(selectedRole);
    return names.length > 0 ? names : FALLBACK_SKILLS;
  }, [selectedRole]);

  const educationLabel = (level: EducationLevel) => {
    const key = level === "None" ? "educationNone" : level === "High School" ? "educationHighSchool" : level === "Bachelor" ? "educationBachelor" : level === "Master" ? "educationMaster" : "educationPhd";
    return t(`step7.${key}`);
  };

  const filteredSkillsForSearch = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    const added = new Set(skills.map((s) => s.name));
    return ALL_SKILLS.filter((s) => {
      if (added.has(s)) return false;
      if (skills.length >= 5) return false;
      const label = (tSkillNames(s) as string).toLowerCase();
      return label.includes(q) || s.toLowerCase().includes(q);
    }).slice(0, 12);
  }, [skillSearch, skills, tSkillNames]);

  const jobLabel = (slug: string) => (slug === "other" ? customJobTitle || "Other" : jobRoles.find((r) => r.slug === slug)?.title ?? slug);
  const displayJobTitle = job === "other" ? customJobTitle.trim() : (selectedRole?.title ?? job ?? "");
  const skillLabel = (s: string) => (ALL_SKILLS.includes(s) ? (tSkillNames(s) as string) : s);
  const workTypeLabel = (key: string) => t(`workTypeLabels.${key}` as any);
  const workTypeDesc = (key: string) => {
    const map: Record<string, string> = {
      "full-time": "fullTimeDesc",
      "part-time": "partTimeDesc",
      temp: "tempDesc",
      remote: "remoteDesc",
    };
    return t(`step3.${map[key] ?? "fullTimeDesc"}` as any);
  };
  const skillLevelLabel = (level: string) => t(`skillLevels.${level}` as any);
  const cityName = (c: { nameEn: string; nameKa?: string }) => (apiLocale === "ka" && c.nameKa ? c.nameKa : c.nameEn);

  const filteredJobs = useMemo(() => {
    const q = jobSearch.trim().toLowerCase();
    if (!q) return jobRoles;
    return jobRoles.filter((r) => r.title.toLowerCase().includes(q));
  }, [jobSearch, jobRoles]);

  const filteredCities = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    return GEORGIAN_CITIES.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        (c.nameKa && c.nameKa.includes(q))
    );
  }, [locationSearch]);

  const selectedCity = useMemo(
    () => GEORGIAN_CITIES.find((c) => c.id === locationCityId) ?? null,
    [locationCityId]
  );

  const [locationInputFocused, setLocationInputFocused] = useState(false);
  const showCityDropdown = locationInputFocused && locationSearch.trim().length >= 2 && !locationCityId;

  function toggleSkill(name: string) {
    const normalized = name.trim();
    if (!normalized || normalized.length < 2) return;
    setSkills((prev) => {
      const exists = prev.some((s) => s.name.toLowerCase() === normalized.toLowerCase());
      if (exists) return prev.filter((s) => s.name.toLowerCase() !== normalized.toLowerCase());
      if (prev.length >= 5) return prev;
      const displayName = normalized.replace(/\b\w/g, (c) => c.toUpperCase());
      return [...prev, { name: displayName }];
    });
  }

  function addCustomSkill() {
    const raw = skillSearch.trim();
    if (raw.length < 2 || skills.length >= 5) return;
    if (skills.some((s) => s.name.toLowerCase() === raw.toLowerCase())) return;
    const match = ALL_SKILLS.find((s) => s.toLowerCase() === raw.toLowerCase());
    const nameToAdd = match ?? raw;
    toggleSkill(nameToAdd);
    addSkillToDb(nameToAdd);
    setSkillSearch("");
  }

  function setSkillLevel(name: string, level: SkillLevel) {
    setSkills((prev) => prev.map((s) => (s.name === name ? { ...s, level } : s)));
  }

  const canContinue = useMemo(() => {
    if (step === 1) return job === "other" ? customJobTitle.trim().length >= 2 : Boolean(job);
    if (step === 2) {
      if (experience === "no") return true;
      if (experience === "yes") {
        const n = parseInt(experienceMonthsText.replace(/[^\d]/g, ""), 10);
        return !isNaN(n) && n > 0;
      }
      return false;
    }
    if (step === 3) return Boolean(workType);
    if (step === 4) return skills.length > 0 && skills.every((s) => Boolean(s.level));
    if (step === 5) return Boolean(locationCityId);
    if (step === 6) {
      const n = parseInt(salary.replace(/\s/g, ""), 10);
      return !isNaN(n) && n > 0;
    }
    if (step === 7) return true; // education always has a value
    if (step === 8) {
      return (
        fullName.trim().length >= 2 &&
        isValidEmail(email) &&
        isValidPhone(phone) &&
        isValidPassword(password)
      );
    }
    return false;
  }, [step, job, customJobTitle, experience, experienceMonthsText, workType, skills, locationCityId, salary, fullName, email, phone, password]);

  function next() {
    if (!canContinue) return;
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
    else if (step === 5) setStep(6);
    else if (step === 6) {
      const num = parseInt(salary.replace(/\s/g, ""), 10);
      if (recommendedSalary != null && !isNaN(num) && num > recommendedSalary) {
        setSalaryConfirmOpen(true);
        return;
      }
      setStep(7);
    } else if (step === 7) setStep(8);
    else if (step === 8) {
      setOtpSentTo("phone");
      setOtp("");
      setRegistrationError(null);
      setOtpOpen(true);
    }
  }

  function back() {
    if (otpOpen) {
      setOtpOpen(false);
      return;
    }
    if (step === 1) return;
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
    else if (step === 6) setStep(5);
    else if (step === 7) setStep(6);
    else if (step === 8) setStep(7);
  }

  function fakeSendOtp(to: "phone" | "email") {
    // MVP: just show modal. Later you'll call your API.
    setOtpSentTo(to);
    setOtp("");
    setOtpOpen(true);
  }

  async function fakeVerifyOtp() {
    const digits = otp.replace(/[^\d]/g, "");
    if (digits.length < 4) return;

    if (job === "other" && displayJobTitle) {
      const levelToWeight = (l?: string) => (l === "Advanced" ? 5 : l === "Intermediate" ? 4 : 3);
      await createJobRoleInDb({
        title: displayJobTitle,
        locale: apiLocale,
        category: "User-added",
        skills: skills.map((s) => ({ skillName: s.name, weight: levelToWeight(s.level) })),
      });
    }

    const profile = buildProfileFromUserFlow({
      job,
      experience,
      experienceText: experienceMonthsText,
      workType,
      skills,
      locationCityId,
      willingToRelocate,
      salary,
      education,
    });
    const stored: StoredCandidateProfile = {
      profile,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      job: displayJobTitle || undefined,
      jobRoleSlug:
        job && job !== "other"
          ? job
          : resolveJobRoleSlug(displayJobTitle) ?? undefined,
      dateOfBirth: dob || null,
    };
    saveCandidateProfile(stored);

    setRegistrationError(null);
    try {
      const res = await fetch("/api/candidates/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          locationCityId: locationCityId ?? "",
          locationDistrictId: locationDistrictId ?? undefined,
          willingToRelocate: profile.willingToRelocate,
          salaryMin: profile.salaryMin,
          experienceMonths: profile.experienceMonths,
          experienceText: experienceMonthsText.trim() || undefined,
          educationLevel: profile.educationLevel,
          workTypes: profile.workTypes,
          skills: profile.skills.map((s) => ({ name: s.name, level: s.level })),
          jobTitle: displayJobTitle || undefined,
          jobRoleSlug:
            job && job !== "other"
              ? job
              : resolveJobRoleSlug(displayJobTitle) ?? undefined,
          sourceLocale: apiLocale,
          dateOfBirth: dob || undefined,
          availableFrom: availableFrom || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        setRegistrationError(data.error || "Failed to create account");
        return;
      }
      if (data.userId && typeof window !== "undefined") {
        window.localStorage.setItem("matcher_candidate_user_id", data.userId);
        if (data.profileId) window.localStorage.setItem("matcher_candidate_profile_id", data.profileId);
      }

      // Log in so session cookie is set; cabinet checks session
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: "CANDIDATE",
        }),
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok || loginData.error) {
        setRegistrationError(loginData.error || "Account created. Please log in.");
        setOtpOpen(false);
        setTimeout(() => router.push("/login?registered=1"), 2000);
        return;
      }

      setOtpOpen(false);
      setRegistrationSuccess(true);
      setTimeout(() => router.push("/cabinet"), 1800);
    } catch (e) {
      console.warn("Failed to save profile to database", e);
      setRegistrationError("Something went wrong. Please try again.");
    }
  }

  const progress = useMemo(() => {
    const map: Record<number, number> = {
      1: 0.08,
      2: 0.22,
      3: 0.36,
      4: 0.5,
      5: 0.64,
      6: 0.78,
      7: 0.88,
      8: 0.96,
    };
    return map[step] ?? 0.1;
  }, [step]);

  const recommendedSalary = useMemo(
    () => (job ? (AVG_SALARY_BY_SLUG[job] ?? 1100) : null),
    [job]
  );

  if (registrationSuccess) {
    return (
      <div className={classNames("flex min-h-screen flex-col items-center justify-center px-4", isDark ? "bg-[#070B12] text-white" : "bg-matcher-pale/30 text-gray-900")}>
        <div className={classNames("w-full max-w-sm rounded-2xl border p-8 text-center shadow-lg", isDark ? "border-white/10 bg-white/5" : "border-matcher/20 bg-white")}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-matcher-mint text-2xl text-matcher-dark">✓</div>
          <h2 className={classNames("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>{t("step8.registrationSuccess")}</h2>
          <p className={classNames("mt-2 text-sm", isDark ? "text-white/70" : "text-gray-600")}>{t("step8.takingYouToCabinet")}</p>
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-matcher border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames("min-h-screen", isDark ? "bg-[#070B12] text-white" : "bg-white text-gray-900")}>
      {/* Top bar */}
      <header className={classNames("sticky top-0 z-20 border-b backdrop-blur", isDark ? "border-white/10 bg-black/30" : "border-gray-200 bg-white/80")}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={back}
            className={classNames(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition",
              isDark ? "text-white/85 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <span className="text-lg">←</span> {t("back")}
          </button>

          <Logo height={64} />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className={classNames("text-sm tabular-nums", isDark ? "text-white/60" : "text-gray-500")}>
              {t("step")} <span className={classNames("font-semibold", isDark ? "text-white" : "text-gray-900")}>{step}</span>/8
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto max-w-2xl px-4 pb-3 sm:px-6">
          <div className={classNames("h-2 w-full rounded-full", isDark ? "bg-white/10" : "bg-gray-100")}>
            <div
              className="h-2 rounded-full bg-matcher transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Subtle step watermark (keeps progress context without sidebar) */}
        <div
          className={classNames(
            "pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none font-black leading-none",
            "text-[160px] sm:text-[220px]",
            isDark ? "text-white/[0.05]" : "text-gray-900/[0.04]"
          )}
          aria-hidden
        >
          {step}
        </div>

        {/* Main card */}
        <section
          className={classNames(
            "relative mx-auto rounded-3xl border p-5 shadow-sm sm:p-7",
            isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-200 bg-white text-gray-900"
          )}
        >
          {/* Elegant stepper */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const n = (i + 1) as number;
                const active = n <= step;
                return (
                  <span
                    key={n}
                    className={classNames(
                      "h-1.5 w-5 rounded-full transition",
                      active ? "bg-matcher" : isDark ? "bg-white/10" : "bg-gray-200"
                    )}
                    aria-hidden
                  />
                );
              })}
            </div>
            <div className={classNames("text-xs font-semibold uppercase tracking-[0.18em]", isDark ? "text-white/60" : "text-gray-500")}>
              {t("step")} {step}/8
            </div>
          </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className={classNames("text-2xl font-semibold tracking-tight sm:text-3xl", isDark ? "text-white" : "text-gray-900")}>{t("step1.title")}</h1>
                <p className={classNames("mt-2", isDark ? "text-white/70" : "text-gray-600")}>
                  {t("step1.subtitle")}
                </p>

                {jobRolesError && (
                  <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                    {jobRolesError}
                  </p>
                )}

                {jobRolesLoading && (
                  <p className={classNames("mt-5 text-sm", isDark ? "text-white/60" : "text-gray-500")}>{tExtras("loadingJobs")}</p>
                )}

                <div className="mt-5">
                  <input
                    value={jobSearch}
                    onChange={(e) => {
                      setJobSearch(e.target.value);
                      setJobListExpanded(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      if (job) {
                        setStep(2);
                      } else if (filteredJobs.length >= 1) {
                        setJob(filteredJobs[0].slug);
                        setStep(2);
                      }
                    }}
                    placeholder={t("step1.placeholder")}
                    className={classNames(
                      "w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none transition",
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-matcher/60 focus:ring-4 focus:ring-matcher/15 focus:shadow-[0_0_0_1px_rgba(139,195,74,0.18)]"
                        : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-matcher/60 focus:ring-4 focus:ring-matcher/10 focus:shadow-md"
                    )}
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {!jobRolesLoading && (jobListExpanded ? filteredJobs : filteredJobs.slice(0, 5)).map((role) => {
                    const active = job === role.slug;
                    return (
                      <button
                        key={role.slug}
                        onClick={() => {
                          setJob(role.slug);
                          setStep(2);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setJob(role.slug);
                            setStep(2);
                          }
                        }}
                        className={classNames(
                          "min-h-[64px] rounded-2xl border px-4 py-3 text-left text-sm transition",
                          active
                            ? isDark
                              ? "border-matcher/60 bg-matcher/15"
                              : "border-matcher bg-matcher-mint"
                            : isDark
                              ? "border-white/10 bg-white/5 hover:bg-white/10"
                              : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className={classNames("font-bold", active ? "text-matcher-bright" : isDark ? "text-white" : "text-gray-900")}>{role.title}</div>
                        <div className={classNames("mt-0.5 text-xs", isDark ? "text-white/55" : "text-gray-500")}>{t("step1.selectToContinue")}</div>
                      </button>
                    );
                  })}
                </div>
                {!jobRolesLoading && filteredJobs.length > 5 && !jobListExpanded && (
                  <button
                    type="button"
                    onClick={() => setJobListExpanded(true)}
                    className={classNames(
                      "mt-4 w-full rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold transition",
                      isDark
                        ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                        : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                    )}
                  >
                    {t("step1.showMore", { count: filteredJobs.length - 5 })}
                  </button>
                )}

                {!jobRolesLoading && (
                  <button
                    type="button"
                    onClick={() => setJob("other")}
                    className={classNames(
                      "mt-3 w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                      job === "other"
                        ? isDark
                          ? "border-matcher/60 bg-matcher/15"
                          : "border-matcher bg-matcher-mint"
                        : isDark
                          ? "border-white/15 bg-transparent text-white/85 hover:bg-white/10"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <span className={classNames("font-bold", isDark ? "text-white" : "text-gray-900")}>{t("step1.otherJob")}</span>
                    <div className={classNames("mt-0.5 text-xs", isDark ? "text-white/55" : "text-gray-500")}>
                      {t("step1.customJobLabel")}
                    </div>
                  </button>
                )}

                {job === "other" && (
                  <div className="mt-4">
                    <label className={classNames("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>{t("step1.customJobLabel")}</label>
                    <input
                      type="text"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      placeholder={t("step1.customJobPlaceholder")}
                      className={classNames(
                        "mt-2 w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none transition",
                        isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-matcher/60 focus:ring-4 focus:ring-matcher/15"
                          : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-matcher/60 focus:ring-4 focus:ring-matcher/10"
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className={classNames("text-2xl font-semibold tracking-tight sm:text-3xl", isDark ? "text-white" : "text-gray-900")}>{t("step2.title")}</h1>
                <p className={classNames("mt-2", isDark ? "text-white/70" : "text-gray-600")}>{t("step2.subtitle")}</p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setExperience("yes")}
                    className={classNames(
                      "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      experience === "yes"
                        ? isDark
                          ? "border-matcher/60 bg-matcher/15 text-matcher-bright"
                          : "border-matcher bg-matcher-mint text-matcher-dark"
                        : isDark
                          ? "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                          : "border-gray-200 text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {t("step2.yes")}
                  </button>
                  <button
                    onClick={() => {
                      setExperience("no");
                      setExperienceMonthsText("");
                    }}
                    className={classNames(
                      "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      experience === "no"
                        ? isDark
                          ? "border-matcher/60 bg-matcher/15 text-matcher-bright"
                          : "border-matcher bg-matcher-mint text-matcher-dark"
                        : isDark
                          ? "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                          : "border-gray-200 text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {t("step2.no")}
                  </button>
                </div>

                {experience === "yes" && (
                  <div className="mt-4">
                    <label className={classNames("text-sm font-medium", isDark ? "text-white/80" : "text-gray-900")}>
                      {t("step2.experienceLabel")}
                    </label>
                    <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                      <input
                        inputMode="numeric"
                        value={experienceMonthsText}
                        onChange={(e) => setExperienceMonthsText(e.target.value.replace(/[^\d]/g, ""))}
                        placeholder={t("step2.experiencePlaceholder")}
                        className={classNames(
                          "w-full rounded-2xl border-2 px-4 py-3 text-sm outline-none transition",
                          isDark
                            ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-matcher/60 focus:ring-4 focus:ring-matcher/15"
                            : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-matcher/60 focus:ring-4 focus:ring-matcher/10 focus:shadow-md"
                        )}
                        aria-label={t("step2.experienceLabel")}
                      />
                      <div
                        className={classNames(
                          "rounded-2xl border px-4 py-3 text-sm font-semibold",
                          isDark ? "border-white/10 bg-white/5 text-white/80" : "border-gray-200 bg-gray-50 text-gray-700"
                        )}
                        aria-hidden
                      >
                        {t("step2.months")}
                      </div>
                    </div>
                    <p className={classNames("mt-2 text-xs", isDark ? "text-white/55" : "text-gray-500")}>
                      {t("step2.experienceHint")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className={classNames("text-2xl font-semibold tracking-tight sm:text-3xl", isDark ? "text-white" : "text-gray-900")}>{t("step3.title")}</h1>
                <p className={classNames("mt-2", isDark ? "text-white/70" : "text-gray-600")}>{t("step3.subtitle")}</p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[
                    { key: "full-time" },
                    { key: "part-time" },
                    { key: "temp" },
                    { key: "remote" },
                  ].map((w) => {
                    const active = workType === (w.key as WorkType);
                    return (
                      <button
                        key={w.key}
                        onClick={() => setWorkType(w.key as WorkType)}
                        className={classNames(
                          "rounded-2xl border px-4 py-3 text-left text-sm transition",
                          active
                            ? isDark
                              ? "border-matcher/60 bg-matcher/15"
                              : "border-matcher bg-matcher-mint"
                            : isDark
                              ? "border-white/15 bg-white/5 hover:bg-white/10"
                              : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className={classNames("font-medium", isDark ? "text-white" : "text-gray-900")}>{workTypeLabel(w.key)}</div>
                        <div className={classNames("mt-0.5 text-xs", isDark ? "text-white/60" : "text-gray-500")}>{workTypeDesc(w.key)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className={classNames("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                  {t("step4.title")}
                </h1>
                <p className={classNames("mt-2 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                  {t("step4.subtitle")}
                </p>

                <div className="mt-5">
                  <div className={classNames("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {t("step4.suggestedFor")}{" "}
                    <span className="font-bold text-matcher-dark">
                      {displayJobTitle || t("step4.yourJob")}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {(suggestedSkills.length ? suggestedSkills : ["Communication", "Teamwork", "Time management"]).map(
                      (s) => {
                        const active = skills.some((x) => x.name === s);
                        const disabled = !active && skills.length >= 5;
                        return (
                          <button
                            key={s}
                            onClick={() => toggleSkill(s)}
                            disabled={disabled}
                            className={classNames(
                              "rounded-full border px-3 py-1.5 text-xs transition",
                              active
                                ? "border-matcher bg-matcher-mint text-matcher-dark"
                                : isDark
                                  ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                              disabled && "opacity-40 cursor-not-allowed"
                            )}
                          >
                            {skillLabel(s)}
                          </button>
                        );
                      }
                    )}
                    {skills.length < 5 && !showAddSkillInput && (
                      <button
                        type="button"
                        onClick={() => setShowAddSkillInput(true)}
                          className={classNames(
                            "rounded-full border-2 border-dashed px-3 py-1.5 text-xs font-medium hover:border-matcher-teal",
                            isDark
                              ? "border-matcher-teal/60 bg-matcher-teal/15 text-matcher-teal hover:bg-matcher-teal/25"
                              : "border-matcher-teal bg-matcher-teal/10 text-matcher-teal hover:bg-matcher-teal/20"
                          )}
                      >
                        + {t("step4.addYourSkill")}
                      </button>
                    )}
                    {skills.length < 5 && showAddSkillInput && (
                      <div className="relative inline-block">
                        <input
                          type="text"
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSkill();
                            }
                            if (e.key === "Escape") setShowAddSkillInput(false);
                          }}
                          placeholder={t("step4.searchSkillsPlaceholder")}
                          className={classNames(
                            "rounded-full border px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-matcher/30 w-48",
                            isDark
                              ? "border-matcher-teal/70 bg-white/5 text-white placeholder:text-gray-400"
                              : "border-matcher bg-matcher-pale text-gray-900 placeholder:text-gray-500"
                          )}
                          autoFocus
                        />
                        {(skillSearch.trim().length >= 2 && (filteredSkillsForSearch.length > 0 || !skills.some((s) => s.name.toLowerCase() === skillSearch.trim().toLowerCase()))) && (
                          <div
                            className={classNames(
                              "absolute z-50 left-0 mt-1 w-56 rounded-2xl border py-1 shadow-xl max-h-48 overflow-y-auto",
                              isDark ? "border-white/15 bg-gray-900" : "border-gray-200 bg-white"
                            )}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {filteredSkillsForSearch.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { toggleSkill(s); setSkillSearch(""); setShowAddSkillInput(false); }}
                                className={classNames(
                                  "w-full px-4 py-2 text-left text-sm",
                                  isDark ? "text-white hover:bg-white/10" : "hover:bg-matcher-mint"
                                )}
                              >
                                {skillLabel(s)}
                              </button>
                            ))}
                            {!skills.some((s) => s.name.toLowerCase() === skillSearch.trim().toLowerCase()) &&
                              !filteredSkillsForSearch.some((s) => s.toLowerCase() === skillSearch.trim().toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => { addCustomSkill(); setShowAddSkillInput(false); }}
                                className={classNames(
                                  "w-full px-4 py-2 text-left text-sm border-t",
                                  isDark
                                    ? "text-matcher-mint border-white/10 hover:bg-white/10"
                                    : "text-matcher-dark border-gray-100 hover:bg-matcher-mint"
                                )}
                              >
                                {t("step4.addCustomSkill", { skill: skillSearch.trim() })}
                              </button>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddSkillInput(false);
                            setSkillSearch("");
                          }}
                          className={classNames(
                            "ml-1.5 text-sm",
                            isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                          )}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={classNames("mt-2 text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                    {t("step4.tip")}
                  </p>
                </div>

                {/* Selected skills + levels */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className={classNames("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {t("step4.selected")} ({skills.length}/5)
                    </p>
                    {skills.length > 0 && (
                      <button
                        onClick={() => setSkills([])}
                        className={classNames(
                          "text-xs",
                          isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"
                        )}
                      >
                        {t("step4.clearAll")}
                      </button>
                    )}
                  </div>

                  {skills.length === 0 ? (
                    <div
                      className={classNames(
                        "mt-3 rounded-2xl border border-dashed p-4 text-sm",
                        isDark ? "border-white/15 text-gray-300" : "border-gray-300 text-gray-500"
                      )}
                    >
                      {t("step4.selectAtLeast")}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {skills.map((sk) => (
                        <div
                          key={sk.name}
                          className={classNames(
                            "rounded-2xl border p-4",
                            isDark ? "border-white/15 bg-white/5" : "border-gray-200 bg-white"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div
                                className={classNames(
                                  "text-sm font-medium",
                                  isDark ? "text-white" : "text-gray-900"
                                )}
                              >
                                {skillLabel(sk.name)}
                              </div>
                              <div className={classNames("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                                {t("step4.pickLevel")}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleSkill(sk.name)}
                              className={classNames(
                                "text-xs",
                                isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-900"
                              )}
                            >
                              {t("step4.remove")}
                            </button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {SKILL_LEVELS.map(({ value, label, icon }) => {
                              const active = sk.level === value;
                              return (
                                <button
                                  key={value}
                                  onClick={() => setSkillLevel(sk.name, value)}
                                  title={label}
                                  className={classNames(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition",
                                    active
                                      ? "border-matcher bg-matcher text-white"
                                      : isDark
                                        ? "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                  )}
                                >
                                  {icon}
                                  {skillLevelLabel(value)}
                                </button>
                              );
                            })}
                          </div>

                          {!sk.level && (
                            <p className="mt-2 text-xs text-red-600">{t("step4.selectLevelToContinue")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5 — Location */}
            {step === 5 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className={classNames("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                  {t("step5.title")}
                </h1>
                <p className={classNames("mt-2 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                  {t("step5.subtitle")}
                </p>

                {/* Free map: Leaflet + CartoDB Voyager (no API key) */}
                <div
                  className={classNames(
                    "mt-5 rounded-2xl border overflow-hidden",
                    isDark ? "border-white/15 bg-white/5" : "border-gray-200 bg-white"
                  )}
                >
                  <GeorgiaMap />
                  <p
                    className={classNames(
                      "px-3 py-2 text-xs border-t",
                      isDark ? "bg-gray-900/90 text-gray-300 border-white/10" : "bg-white text-gray-500 border-gray-200"
                    )}
                  >
                    {t("step5.georgia")}
                  </p>
                </div>

                <div className="mt-5 relative">
                  <label className={classNames("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {t("step5.city")}
                  </label>
                  <div className="mt-2 relative">
                    <input
                      value={selectedCity ? cityName(selectedCity) : locationSearch}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (selectedCity) {
                          setLocationCityId(null);
                          setLocationDistrictId(null);
                        }
                        setLocationSearch(v);
                      }}
                      onFocus={() => setLocationInputFocused(true)}
                      onBlur={() => setTimeout(() => setLocationInputFocused(false), 150)}
                      placeholder={t("step5.cityPlaceholder")}
                      className={classNames(
                        "w-full rounded-2xl border px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                        isDark
                          ? "border-white/20 bg-white/5 text-white placeholder:text-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                      )}
                    />
                    {selectedCity && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocationCityId(null);
                          setLocationDistrictId(null);
                          setLocationSearch("");
                        }}
                        className={classNames(
                          "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1",
                          isDark
                            ? "text-gray-400 hover:bg-white/10 hover:text-gray-100"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        )}
                        aria-label="Change city"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {showCityDropdown && filteredCities.length > 0 && (
                    <div
                      className={classNames(
                        "absolute z-10 mt-1 w-full rounded-2xl border py-1 shadow-lg max-h-56 overflow-y-auto",
                        isDark ? "bg-gray-900 border-white/15" : "bg-white border-gray-200"
                      )}
                    >
                      {filteredCities.map((city) => {
                        const region = GEORGIAN_REGIONS.find((r) => r.id === city.regionId);
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              setLocationCityId(city.id);
                              setLocationDistrictId(city.districts?.length ? null : null);
                              setLocationSearch("");
                            }}
                            className={classNames(
                              "w-full px-4 py-2.5 text-left text-sm flex flex-col",
                              isDark ? "text-white hover:bg-white/10" : "hover:bg-matcher-mint"
                            )}
                          >
                            <span
                              className={classNames(
                                "font-medium",
                                isDark ? "text-white" : "text-gray-900"
                              )}
                            >
                              {cityName(city)}
                            </span>
                            {region && (
                              <span className={classNames("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                                {cityName(region)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {showCityDropdown && locationSearch.trim().length >= 2 && filteredCities.length === 0 && (
                    <div
                      className={classNames(
                        "absolute z-10 mt-1 w-full rounded-2xl border px-4 py-3 text-sm",
                        isDark ? "bg-gray-900 text-gray-300 border-white/15" : "bg-white text-gray-500 border-gray-200"
                      )}
                    >
                      {t("step5.noCitiesFound")}
                    </div>
                  )}
                </div>

                {selectedCity?.districts && selectedCity.districts.length > 0 && (
                  <div className="mt-4">
                    <label className={classNames("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {t("step5.district")} — {cityName(selectedCity)}
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setLocationDistrictId(null)}
                        className={classNames(
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          locationDistrictId === null
                            ? "border-matcher bg-matcher-mint text-matcher-dark"
                            : isDark
                              ? "border-white/20 text-white/80 hover:bg-white/10"
                              : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {t("step5.any")}
                      </button>
                      {selectedCity.districts.map((d) => {
                        const active = locationDistrictId === d.id;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setLocationDistrictId(d.id)}
                            className={classNames(
                              "rounded-full border px-3 py-1.5 text-xs transition",
                              active
                                ? "border-matcher bg-matcher-mint text-matcher-dark"
                                : isDark
                                  ? "border-white/20 text-white/80 hover:bg-white/10"
                                  : "border-gray-200 hover:bg-gray-50"
                            )}
                          >
                            {cityName(d)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedCity && (
                  <p className={classNames("mt-3 text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                    {t("step5.selected")}:{" "}
                    <span className={classNames("font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {cityName(selectedCity)}
                      {locationDistrictId && selectedCity.districts
                        ? (() => {
                            const d = selectedCity.districts!.find((x) => x.id === locationDistrictId);
                            return d ? ` — ${cityName(d)}` : "";
                          })()
                        : ""}
                    </span>
                  </p>
                )}

                <div className="mt-5">
                  <label className={classNames("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {t("step5.willingToRelocate")}
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setWillingToRelocate(false)}
                      className={classNames(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        !willingToRelocate
                          ? "border-matcher bg-matcher-mint text-matcher-dark"
                          : isDark
                            ? "border-white/20 text-white/80 hover:bg-white/10"
                            : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {t("step5.willingToRelocateNo")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWillingToRelocate(true)}
                      className={classNames(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        willingToRelocate
                          ? "border-matcher bg-matcher-mint text-matcher-dark"
                          : isDark
                            ? "border-white/20 text-white/80 hover:bg-white/10"
                            : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {t("step5.willingToRelocateYes")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 — Salary */}
            {step === 6 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step6.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step6.subtitle")}
                </p>

                {recommendedSalary != null && (
                  <div className="mt-5 rounded-2xl border border-matcher bg-matcher-mint p-4">
                    <p className="text-sm font-medium text-matcher-dark">
                      {t("step6.averageFor")} <span className="font-bold text-matcher-dark">{displayJobTitle}</span> {t("step6.averageInGeorgia")}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-matcher-dark">
                      {recommendedSalary.toLocaleString()} ₾ <span className="text-base font-normal text-matcher-dark">{t("step8.perMonth")}</span>
                    </p>
                    <p className="mt-2 text-xs text-matcher-dark">
                      {t("step6.basedOnCurrent")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSalary(String(recommendedSalary))}
                      className="mt-3 rounded-xl bg-matcher px-4 py-2 text-sm font-medium text-white hover:bg-matcher-dark"
                    >
                      {t("step6.useThisAmount")}
                    </button>
                  </div>
                )}

                <div className="mt-5">
                  <label className="text-sm font-medium text-gray-900">{t("step6.desiredSalary")}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value.replace(/[^\d\s]/g, ""))}
                    placeholder={t("step6.placeholder")}
                    className={classNames(
                      "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                      salary.length > 0 &&
                        (isNaN(parseInt(salary.replace(/\s/g, ""), 10)) ||
                          parseInt(salary.replace(/\s/g, ""), 10) <= 0) &&
                        "border-red-300"
                    )}
                  />
                  {salary.length > 0 &&
                    (isNaN(parseInt(salary.replace(/\s/g, ""), 10)) ||
                      parseInt(salary.replace(/\s/g, ""), 10) <= 0) && (
                      <p className="mt-2 text-xs text-red-600">{t("step6.validNumber")}</p>
                    )}
                </div>
              </div>
            )}

            {/* STEP 7 — Education only */}
            {step === 7 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step7.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step7.subtitle")}
                </p>
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-900">{t("step7.education")}</label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value as EducationLevel)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  >
                    <option value="None">{educationLabel("None")}</option>
                    <option value="High School">{educationLabel("High School")}</option>
                    <option value="Bachelor">{educationLabel("Bachelor")}</option>
                    <option value="Master">{educationLabel("Master")}</option>
                    <option value="PhD">{educationLabel("PhD")}</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 8 — Registration (personal info) */}
            {step === 8 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step8.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step8.subtitle")}
                </p>

                <div className="mt-6 grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900">{t("step8.fullName")}</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("step8.fullNamePlaceholder")}
                      className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-900">{t("step8.dateOfBirth")}</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                      />
                      <p className="mt-1 text-xs text-gray-500">{t("step8.dateOfBirthHint")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">{t("step8.availableFrom")}</label>
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                      />
                      <p className="mt-1 text-xs text-gray-500">{t("step8.availableFromHint")}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-900">{t("step8.email")}</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("step8.emailPlaceholder")}
                        className={classNames(
                          "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                          email.length > 0 && !isValidEmail(email) && "border-red-300"
                        )}
                      />
                      {email.length > 0 && !isValidEmail(email) && (
                        <p className="mt-2 text-xs text-red-600">{t("step8.validEmail")}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-900">{t("step8.phone")}</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("step8.phonePlaceholder")}
                        className={classNames(
                          "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                          phone.length > 0 && !isValidPhone(phone) && "border-red-300"
                        )}
                      />
                      {phone.length > 0 && !isValidPhone(phone) && (
                        <p className="mt-2 text-xs text-red-600">{t("step8.validPhone")}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900">{t("step8.password")}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("step8.passwordPlaceholder")}
                      className={classNames(
                        "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                        password.length > 0 && !isValidPassword(password) && "border-red-300"
                      )}
                    />
                    {password.length > 0 && !isValidPassword(password) && (
                      <p className="mt-2 text-xs text-red-600">{t("step8.passwordMin")}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <div className="text-sm font-medium text-gray-900">{t("step8.yourAnswers")}</div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>
                        <span className="text-gray-500">{t("step8.job")}:</span>{" "}
                        <span className="font-bold text-matcher-dark">{displayJobTitle || "—"}</span>
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step8.education")}:</span> {educationLabel(education)}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step8.experience")}:</span>{" "}
                        {experience === "yes"
                          ? experienceMonthsText.trim()
                            ? `${experienceMonthsText.trim()} ${t("step2.months")}`
                            : "—"
                          : experience === "no"
                            ? t("step2.no")
                            : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step8.schedule")}:</span> {workType ? workTypeLabel(workType) : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step8.skills")}:</span>{" "}
                        {skills.length
                          ? skills.map((s) => `${skillLabel(s.name)} (${s.level ? skillLevelLabel(s.level) : "—"})`).join(", ")
                          : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step8.location")}:</span>{" "}
                        {selectedCity
                          ? locationDistrictId && selectedCity.districts
                            ? (() => {
                                const d = selectedCity.districts!.find((x) => x.id === locationDistrictId);
                                return d ? `${cityName(selectedCity)}, ${cityName(d)}` : cityName(selectedCity);
                              })()
                            : cityName(selectedCity)
                          : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step8.salary")}:</span>{" "}
                        {salary
                          ? `${parseInt(salary.replace(/\s/g, ""), 10).toLocaleString()} ₾ ${t("step8.perMonth")}`
                          : "—"}
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fakeSendOtp("phone")}
                      className="rounded-2xl border px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      {t("step8.verifySms")}
                    </button>
                    <button
                      type="button"
                      onClick={() => fakeSendOtp("email")}
                      className="rounded-2xl border px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      {t("step8.verifyEmail")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={back}
                className={classNames(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isDark ? "text-white/80 hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {t("back")}
              </button>

              <button
                onClick={next}
                disabled={!canContinue}
                className={classNames(
                  "rounded-2xl px-5 py-3 text-sm font-semibold transition",
                  canContinue
                    ? "bg-matcher text-white hover:bg-matcher-dark"
                    : isDark
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                )}
              >
                {step < 8 ? t("continue") : t("createAccount")}
              </button>
            </div>
        </section>
      </main>

      {/* Salary above recommended — confirm to continue */}
      {salaryConfirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">{tCommon("salaryConfirmTitle")}</h2>
            <p className="mt-2 text-sm text-gray-600">{tCommon("salaryConfirmMessage")}</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSalaryConfirmOpen(false)}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {tCommon("salaryConfirmChange")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSalaryConfirmOpen(false);
                  setStep(7);
                }}
                className="flex-1 rounded-2xl bg-matcher px-4 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
              >
                {tCommon("salaryConfirmContinue")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {otpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Verify your {otpSentTo === "phone" ? "phone" : "email"}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter the code we sent to your {otpSentTo === "phone" ? "number" : "email"}.
                </p>
              </div>
              <button
                onClick={() => setOtpOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-900">Verification code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g., 1234"
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              />
              <p className="mt-2 text-xs text-gray-500">MVP: any 4+ digits will pass.</p>
              {registrationError && (
                <p className="mt-3 text-sm text-red-600">{registrationError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => {
                  // resend same channel
                  setOtp("");
                  // in real implementation call API resend
                }}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Resend code
              </button>

              <button
                onClick={fakeVerifyOtp}
                className="rounded-2xl bg-matcher px-5 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* tiny keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
