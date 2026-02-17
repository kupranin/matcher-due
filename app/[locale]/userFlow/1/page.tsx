"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
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
import { fetchJobTemplates, AVG_SALARY_BY_SLUG, getSkillsForRoleSlug, type JobTemplateRole } from "@/lib/jobTemplates";
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
  const tExtras = useTranslations("userFlowExtras");
  const tSkillNames = useTranslations("skillNames");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Job templates from DB
  const [jobRoles, setJobRoles] = useState<JobTemplateRole[]>([]);
  const [jobRolesLoading, setJobRolesLoading] = useState(true);
  const [jobRolesError, setJobRolesError] = useState<string | null>(null);

  useEffect(() => {
    setJobRolesLoading(true);
    setJobRolesError(null);
    fetchJobTemplates(locale as "en" | "ka")
      .then(setJobRoles)
      .catch((e) => setJobRolesError(e instanceof Error ? e.message : tExtras("failedToLoadJobs")))
      .finally(() => setJobRolesLoading(false));
  }, [locale]);

  // Step 1 — job is slug (e.g. "barista")
  const [job, setJob] = useState<string | null>(null);
  const [jobSearch, setJobSearch] = useState("");
  const [jobListExpanded, setJobListExpanded] = useState(false);

  const selectedRole = useMemo(
    () => (job ? jobRoles.find((r) => r.slug === job) ?? null : null),
    [job, jobRoles]
  );

  // Step 2
  const [experience, setExperience] = useState<ExperienceAnswer>(null);
  const [experienceText, setExperienceText] = useState("");

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

  // Step 6 — salary
  const [salary, setSalary] = useState("");
  const [education, setEducation] = useState<EducationLevel>("High School");

  // Step 7 registration
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // OTP modal
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState<"phone" | "email">("phone");

  const suggestedSkills = useMemo(() => {
    if (!selectedRole) return [];
    const names = getSkillsForRoleSlug(selectedRole.slug);
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

  const jobLabel = (slug: string) => jobRoles.find((r) => r.slug === slug)?.title ?? slug;
  const skillLabel = (s: string) => (ALL_SKILLS.includes(s) ? (tSkillNames(s) as string) : s);
  const workTypeLabel = (key: string) => t(`workTypeLabels.${key}` as any);
  const workTypeDesc = (key: string) => t(`step3.${key}Desc` as any);
  const skillLevelLabel = (level: string) => t(`skillLevels.${level}` as any);
  const cityName = (c: { nameEn: string; nameKa?: string }) => (locale === "ka" && c.nameKa ? c.nameKa : c.nameEn);

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
    toggleSkill(match ?? raw);
    setSkillSearch("");
  }

  function setSkillLevel(name: string, level: SkillLevel) {
    setSkills((prev) => prev.map((s) => (s.name === name ? { ...s, level } : s)));
  }

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(job);
    if (step === 2) {
      if (experience === "no") return true;
      if (experience === "yes") return experienceText.trim().length >= 2;
      return false;
    }
    if (step === 3) return Boolean(workType);
    if (step === 4) return skills.length > 0 && skills.every((s) => Boolean(s.level));
    if (step === 5) return Boolean(locationCityId);
    if (step === 6) {
      const n = parseInt(salary.replace(/\s/g, ""), 10);
      return !isNaN(n) && n > 0;
    }
    if (step === 7) {
      return (
        fullName.trim().length >= 2 &&
        isValidEmail(email) &&
        isValidPhone(phone) &&
        isValidPassword(password)
      );
    }
    return false;
  }, [step, job, experience, experienceText, workType, skills, locationCityId, salary, fullName, email, phone, password]);

  function next() {
    if (!canContinue) return;
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
    else if (step === 5) setStep(6);
    else if (step === 6) setStep(7);
    else if (step === 7) {
      setOtpSentTo("phone");
      setOtp("");
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
  }

  function fakeSendOtp(to: "phone" | "email") {
    // MVP: just show modal. Later you'll call your API.
    setOtpSentTo(to);
    setOtp("");
    setOtpOpen(true);
  }

  function fakeVerifyOtp() {
    // MVP: accept any 4-6 digits
    const digits = otp.replace(/[^\d]/g, "");
    if (digits.length < 4) return;

    // Save candidate profile from userFlow data before redirect
    const profile = buildProfileFromUserFlow({
      job,
      experience,
      experienceText,
      workType,
      skills,
      locationCityId,
      salary,
      education,
    });
    const stored: StoredCandidateProfile = {
      profile,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };
    saveCandidateProfile(stored);

    setOtpOpen(false);
    router.push("/cabinet");
  }

  const progress = useMemo(() => {
    const map: Record<number, number> = {
      1: 0.1,
      2: 0.24,
      3: 0.38,
      4: 0.52,
      5: 0.66,
      6: 0.8,
      7: 0.92,
    };
    return map[step] ?? 0.1;
  }, [step]);

  const recommendedSalary = useMemo(
    () => (job ? (AVG_SALARY_BY_SLUG[job] ?? 1100) : null),
    [job]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={back}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className="text-lg">←</span> {t("back")}
          </button>

          <Logo height={72} />

          <div className="text-sm text-gray-500">
            {t("step")} <span className="text-gray-900 font-medium">{step}</span>/7
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-matcher transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1fr_340px]">
          {/* Main card */}
          <section className="rounded-3xl border bg-white p-6 shadow-sm">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step1.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step1.subtitle")}
                </p>

                {jobRolesError && (
                  <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                    {jobRolesError}
                  </p>
                )}

                {jobRolesLoading && (
                  <p className="mt-5 text-sm text-gray-500">{tExtras("loadingJobs")}</p>
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
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
                          "rounded-2xl border px-4 py-3 text-left text-sm transition",
                          active
                            ? "border-matcher bg-matcher-mint"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className={classNames("font-bold", active ? "text-matcher-dark" : "text-gray-900")}>{role.title}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{t("step1.selectToContinue")}</div>
                      </button>
                    );
                  })}
                </div>
                {!jobRolesLoading && filteredJobs.length > 5 && !jobListExpanded && (
                  <button
                    type="button"
                    onClick={() => setJobListExpanded(true)}
                    className="mt-3 w-full rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                  >
                    {t("step1.showMore", { count: filteredJobs.length - 5 })}
                  </button>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step2.title")}</h1>
                <p className="mt-2 text-gray-600">{t("step2.subtitle")}</p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setExperience("yes")}
                    className={classNames(
                      "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      experience === "yes"
                        ? "border-matcher bg-matcher-mint"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {t("step2.yes")}
                  </button>
                  <button
                    onClick={() => {
                      setExperience("no");
                      setExperienceText("");
                    }}
                    className={classNames(
                      "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      experience === "no"
                        ? "border-matcher bg-matcher-mint"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {t("step2.no")}
                  </button>
                </div>

                {experience === "yes" && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-900">{t("step2.experienceLabel")}</label>
                    <textarea
                      value={experienceText}
                      onChange={(e) => setExperienceText(e.target.value)}
                      placeholder={t("step2.experiencePlaceholder")}
                      className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                      rows={4}
                    />
                    <p className="mt-2 text-xs text-gray-500">{t("step2.experienceHint")}</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step3.title")}</h1>
                <p className="mt-2 text-gray-600">{t("step3.subtitle")}</p>

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
                            ? "border-matcher bg-matcher-mint"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <div className="font-medium text-gray-900">{workTypeLabel(w.key)}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{workTypeDesc(w.key)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step4.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step4.subtitle")}
                </p>

                <div className="mt-5">
                  <div className="text-sm font-medium text-gray-900">{t("step4.suggestedFor")} <span className="font-bold text-matcher-dark">{selectedRole ? selectedRole.title : t("step4.yourJob")}</span></div>
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
                        className="rounded-full border-2 border-dashed border-matcher-teal bg-matcher-teal/10 px-3 py-1.5 text-xs font-medium text-matcher-teal hover:bg-matcher-teal/20 hover:border-matcher-teal"
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
                          className="rounded-full border border-matcher bg-matcher-pale px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-matcher/30 w-48"
                          autoFocus
                        />
                        {(skillSearch.trim().length >= 2 && (filteredSkillsForSearch.length > 0 || !skills.some((s) => s.name.toLowerCase() === skillSearch.trim().toLowerCase()))) && (
                          <div className="absolute z-50 left-0 mt-1 w-56 rounded-2xl border border-gray-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto" onMouseDown={(e) => e.preventDefault()}>
                            {filteredSkillsForSearch.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { toggleSkill(s); setSkillSearch(""); setShowAddSkillInput(false); }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-matcher-mint"
                              >
                                {skillLabel(s)}
                              </button>
                            ))}
                            {!skills.some((s) => s.name.toLowerCase() === skillSearch.trim().toLowerCase()) &&
                              !filteredSkillsForSearch.some((s) => s.toLowerCase() === skillSearch.trim().toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => { addCustomSkill(); setShowAddSkillInput(false); }}
                                className="w-full px-4 py-2 text-left text-sm text-matcher-dark hover:bg-matcher-mint border-t border-gray-100"
                              >
                                {t("step4.addCustomSkill", { skill: skillSearch.trim() })}
                              </button>
                            )}
                          </div>
                        )}
                        <button type="button" onClick={() => { setShowAddSkillInput(false); setSkillSearch(""); }} className="ml-1.5 text-gray-500 hover:text-gray-700">×</button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{t("step4.tip")}</p>
                </div>

                {/* Selected skills + levels */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{t("step4.selected")} ({skills.length}/5)</p>
                    {skills.length > 0 && (
                      <button
                        onClick={() => setSkills([])}
                        className="text-xs text-gray-500 hover:text-gray-900"
                      >
                        {t("step4.clearAll")}
                      </button>
                    )}
                  </div>

                  {skills.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-dashed p-4 text-sm text-gray-500">
                      {t("step4.selectAtLeast")}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {skills.map((sk) => (
                        <div key={sk.name} className="rounded-2xl border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{skillLabel(sk.name)}</div>
                              <div className="text-xs text-gray-500">{t("step4.pickLevel")}</div>
                            </div>
                            <button
                              onClick={() => toggleSkill(sk.name)}
                              className="text-xs text-gray-500 hover:text-gray-900"
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
                <h1 className="text-2xl font-semibold tracking-tight">{t("step5.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step5.subtitle")}
                </p>

                {/* Free map: Leaflet + CartoDB Voyager (no API key) */}
                <div className="mt-5 rounded-2xl border overflow-hidden">
                  <GeorgiaMap />
                  <p className="px-3 py-2 text-xs text-gray-500 bg-white border-t">
                    {t("step5.georgia")}
                  </p>
                </div>

                <div className="mt-5 relative">
                  <label className="text-sm font-medium text-gray-900">{t("step5.city")}</label>
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
                      className="w-full rounded-2xl border px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                    />
                    {selectedCity && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocationCityId(null);
                          setLocationDistrictId(null);
                          setLocationSearch("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Change city"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {showCityDropdown && filteredCities.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-2xl border bg-white py-1 shadow-lg max-h-56 overflow-y-auto">
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
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-matcher-mint flex flex-col"
                          >
                            <span className="font-medium text-gray-900">{cityName(city)}</span>
                            {region && (
                              <span className="text-xs text-gray-500">{cityName(region)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {showCityDropdown && locationSearch.trim().length >= 2 && filteredCities.length === 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-500">
                      {t("step5.noCitiesFound")}
                    </div>
                  )}
                </div>

                {selectedCity?.districts && selectedCity.districts.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-900">
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
                  <p className="mt-3 text-sm text-gray-600">
                    {t("step5.selected")}:{" "}
                    <span className="font-medium text-gray-900">
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
                      {t("step6.averageFor")} <span className="font-bold text-matcher-dark">{selectedRole ? selectedRole.title : ""}</span> {t("step6.averageInGeorgia")}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-matcher-dark">
                      {recommendedSalary.toLocaleString()} ₾ <span className="text-base font-normal text-matcher-dark">{t("step7.perMonth")}</span>
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

            {/* STEP 7 — Registration */}
            {step === 7 && (
              <div className="animate-[fadeIn_240ms_ease-out]">
                <h1 className="text-2xl font-semibold tracking-tight">{t("step7.title")}</h1>
                <p className="mt-2 text-gray-600">
                  {t("step7.subtitle")}
                </p>

                <div className="mt-6 grid gap-4">
                  <div>
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

                  <div>
                    <label className="text-sm font-medium text-gray-900">{t("step7.fullName")}</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("step7.fullNamePlaceholder")}
                      className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-900">{t("step7.email")}</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("step7.emailPlaceholder")}
                        className={classNames(
                          "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                          email.length > 0 && !isValidEmail(email) && "border-red-300"
                        )}
                      />
                      {email.length > 0 && !isValidEmail(email) && (
                        <p className="mt-2 text-xs text-red-600">{t("step7.validEmail")}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-900">{t("step7.phone")}</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t("step7.phonePlaceholder")}
                        className={classNames(
                          "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                          phone.length > 0 && !isValidPhone(phone) && "border-red-300"
                        )}
                      />
                      {phone.length > 0 && !isValidPhone(phone) && (
                        <p className="mt-2 text-xs text-red-600">{t("step7.validPhone")}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900">{t("step7.password")}</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("step7.passwordPlaceholder")}
                      className={classNames(
                        "mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30",
                        password.length > 0 && !isValidPassword(password) && "border-red-300"
                      )}
                    />
                    {password.length > 0 && !isValidPassword(password) && (
                      <p className="mt-2 text-xs text-red-600">{t("step7.passwordMin")}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border bg-gray-50 p-4">
                    <div className="text-sm font-medium text-gray-900">{t("step7.yourAnswers")}</div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>
                        <span className="text-gray-500">{t("step7.job")}:</span>{" "}
                        <span className="font-bold text-matcher-dark">{selectedRole ? selectedRole.title : "—"}</span>
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step7.education")}:</span> {educationLabel(education)}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step7.experience")}:</span>{" "}
                        {experience === "yes" ? experienceText : experience === "no" ? t("step2.no") : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step7.schedule")}:</span> {workType ? workTypeLabel(workType) : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step7.skills")}:</span>{" "}
                        {skills.length
                          ? skills.map((s) => `${skillLabel(s.name)} (${s.level ? skillLevelLabel(s.level) : "—"})`).join(", ")
                          : "—"}
                      </li>
                      <li>
                        <span className="text-gray-500">{t("step7.location")}:</span>{" "}
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
                        <span className="text-gray-500">{t("step7.salary")}:</span>{" "}
                        {salary
                          ? `${parseInt(salary.replace(/\s/g, ""), 10).toLocaleString()} ₾ ${t("step7.perMonth")}`
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
                      {t("step7.verifySms")}
                    </button>
                    <button
                      type="button"
                      onClick={() => fakeSendOtp("email")}
                      className="rounded-2xl border px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      {t("step7.verifyEmail")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={back}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                )}
              >
                {step < 7 ? t("continue") : t("createAccount")}
              </button>
            </div>
          </section>

          {/* Side panel (nice for desktop) */}
          <aside className="hidden md:block">
            <div className="rounded-3xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">{t("whyThisWorks")}</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>{t("noCv")}</li>
                <li>{t("minutes")}</li>
                <li>{t("skillsMatching")}</li>
                <li>{t("swipeToMatch")}</li>
              </ul>

              <div className="mt-5 rounded-2xl bg-matcher-mint p-4">
                <div className="text-sm font-semibold text-matcher-dark">{t("mvpNote")}</div>
                <p className="mt-1 text-sm text-matcher-dark/80">
                  {t("mvpNoteText")}
                </p>
              </div>

              <div className="mt-5 space-y-1 text-xs text-gray-400">
                <p>
                  <Link className="text-gray-700 underline" href="/">
                    {t("home")}
                  </Link>
                </p>
                <p>
                  <Link className="text-gray-700 underline" href="/cabinet/profile">
                    {t("editProfile")}
                  </Link>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

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
