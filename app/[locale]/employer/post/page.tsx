"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { GEORGIAN_CITIES } from "@/lib/georgianLocations";
import Logo from "@/components/Logo";
import { fetchJobTemplates, type JobTemplateRole } from "@/lib/jobTemplates";

const PACKAGES = [
  { id: "1", vacancies: 1, price: 40, label: "1 vacancy" },
  { id: "5", vacancies: 5, price: 170, label: "5 vacancies" },
  { id: "10", vacancies: 10, price: 400, label: "10 vacancies" },
  { id: "unlimited", vacancies: -1, price: 1000, label: "Unlimited" },
] as const;

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const FALLBACK_SKILLS = ["Communication", "Teamwork", "Time management", "Customer service", "Problem solving"];

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
type VacancySkill = { name: string; level?: SkillLevel };

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 9;
}

type Step = "vacancy" | "package" | "payment" | "success";

export default function EmployerPostPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromRegistration = searchParams.get("registered") === "1";
  const fromCabinet = searchParams.get("from") === "cabinet";

  const [step, setStep] = useState<Step>("vacancy");
  const [selectedPackage, setSelectedPackage] = useState<(typeof PACKAGES)[number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"invoice" | "card" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jobRoles, setJobRoles] = useState<JobTemplateRole[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.sessionStorage.getItem("employerLoggedIn")) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    fetchJobTemplates(locale as "en" | "ka").then(setJobRoles).catch(() => setJobRoles([]));
  }, [locale]);

  const [jobTitle, setJobTitle] = useState("");
  const [jobSlug, setJobSlug] = useState<string | null>(null);
  const [jobTitleFocused, setJobTitleFocused] = useState(false);

  const selectedRole = useMemo(
    () => (jobSlug ? jobRoles.find((r) => r.slug === jobSlug) ?? null : jobRoles.find((r) => r.title === jobTitle) ?? null),
    [jobSlug, jobTitle, jobRoles]
  );
  const [locationCityId, setLocationCityId] = useState("");
  const [locationDistrictId, setLocationDistrictId] = useState("");

  const selectedCity = useMemo(
    () => GEORGIAN_CITIES.find((c) => c.id === locationCityId) ?? null,
    [locationCityId]
  );
  const [experienceRequired, setExperienceRequired] = useState<"yes" | "no">("no");
  const [requiredExperienceMonths, setRequiredExperienceMonths] = useState(6);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<VacancySkill[]>([]);
  const [goodToHaveSkills, setGoodToHaveSkills] = useState<VacancySkill[]>([]);
  const [addingAsRequired, setAddingAsRequired] = useState(true);
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const filteredJobs = useMemo(() => {
    const q = jobTitle.trim().toLowerCase();
    if (q.length < 2) return [];
    return jobRoles.filter((r) => r.title.toLowerCase().includes(q));
  }, [jobTitle, jobRoles]);

  const showJobDropdown = jobTitleFocused && jobTitle.trim().length >= 2 && filteredJobs.length > 0;

  const suggestedSkills = useMemo(() => {
    if (selectedRole) {
      const names = selectedRole.skills.map((s) => s.skillName);
      return names.length > 0 ? names : FALLBACK_SKILLS;
    }
    return FALLBACK_SKILLS;
  }, [selectedRole]);

  function addSkill(s: string) {
    const inRequired = requiredSkills.some((x) => x.name === s);
    const inGood = goodToHaveSkills.some((x) => x.name === s);
    if (inRequired || inGood) return;
    const skill: VacancySkill = { name: s, level: "Intermediate" };
    if (addingAsRequired && requiredSkills.length < 5) {
      setRequiredSkills((prev) => [...prev, skill]);
    } else if (!addingAsRequired && goodToHaveSkills.length < 5) {
      setGoodToHaveSkills((prev) => [...prev, skill]);
    }
  }

  function removeSkill(name: string, isRequired: boolean) {
    if (isRequired) setRequiredSkills((prev) => prev.filter((x) => x.name !== name));
    else setGoodToHaveSkills((prev) => prev.filter((x) => x.name !== name));
  }

  function setSkillLevel(name: string, level: SkillLevel, isRequired: boolean) {
    if (isRequired) {
      setRequiredSkills((prev) =>
        prev.map((sk) => (sk.name === name ? { ...sk, level } : sk))
      );
    } else {
      setGoodToHaveSkills((prev) =>
        prev.map((sk) => (sk.name === name ? { ...sk, level } : sk))
      );
    }
  }

  function moveSkill(name: string, fromRequired: boolean) {
    const skill = fromRequired
      ? requiredSkills.find((x) => x.name === name)
      : goodToHaveSkills.find((x) => x.name === name);
    if (!skill) return;
    if (fromRequired) {
      if (goodToHaveSkills.length >= 5) return;
      setRequiredSkills((prev) => prev.filter((x) => x.name !== name));
      setGoodToHaveSkills((prev) => [...prev, skill]);
    } else {
      if (requiredSkills.length >= 5) return;
      setGoodToHaveSkills((prev) => prev.filter((x) => x.name !== name));
      setRequiredSkills((prev) => [...prev, skill]);
    }
  }

  function handleJobTitleSelect(role: JobTemplateRole) {
    setJobTitle(role.title);
    setJobSlug(role.slug);
    setDescription(role.description);
    setRequiredSkills([]);
    setGoodToHaveSkills([]);
  }

  function handleJobTitleChange(value: string) {
    setJobTitle(value);
    const match = jobRoles.find((r) => r.title === value);
    if (match) {
      setJobSlug(match.slug);
      setDescription(match.description);
      setRequiredSkills([]);
      setGoodToHaveSkills([]);
    } else {
      setJobSlug(null);
    }
  }

  const canSubmit =
    jobTitle.trim().length >= 2 &&
    requiredSkills.length > 0 &&
    requiredSkills.every((s) => Boolean(s.level)) &&
    locationCityId &&
    (isLoggedIn || (isValidEmail(contactEmail) && isValidPhone(contactPhone) && contactName.trim().length >= 2));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStep("package");
  }

  function handlePackageSelect(pkg: (typeof PACKAGES)[number]) {
    setSelectedPackage(pkg);
    setStep("payment");
  }

  function handlePaymentMethod(method: "invoice" | "card") {
    setPaymentMethod(method);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("employerHasSubscription", "1");
    }
    setStep("success");
  }

  function handleGoToCabinet() {
    router.push("/employer/cabinet");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo height={80} />
          <Link
            href={fromCabinet ? "/employer/cabinet" : "/employer"}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-16">
        {/* Step: Package selection */}
        {step === "package" && (
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Choose your package
            </h1>
            <p className="mt-2 text-gray-600">
              Your vacancy is ready. Select a package to publish it. Valid for 1 year.
            </p>
            <div className="mt-8 grid gap-4">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handlePackageSelect(pkg)}
                  className="flex w-full items-center justify-between rounded-2xl border-2 border-gray-200 p-5 text-left transition hover:border-matcher hover:bg-matcher-pale"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{pkg.label}</span>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {pkg.vacancies === -1 ? "Post as many vacancies as you need" : `${pkg.vacancies} vacancy slots`}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-matcher-dark">{pkg.price} GEL</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              Package expires in 1 year
            </p>
            <button
              type="button"
              onClick={() => setStep("vacancy")}
              className="mt-6 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Back to vacancy
            </button>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="rounded-3xl border-2 border-matcher/30 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-matcher-mint text-4xl">
                ✓
              </div>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
                {paymentMethod === "invoice" ? "Invoice on the way" : "Payment successful"}
              </h1>
              <p className="mt-3 text-gray-600">
                {paymentMethod === "invoice" ? (
                  <>
                    We will send you the invoice to your email within the next few minutes.
                    You can complete payment by bank transfer. Your vacancy will go live once payment is confirmed.
                  </>
                ) : (
                  "Your vacancy is now live. Start browsing candidates in your cabinet."
                )}
              </p>
              <button
                type="button"
                onClick={handleGoToCabinet}
                className="mt-8 rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
              >
                Go to cabinet
              </button>
            </div>
          </div>
        )}

        {/* Step: Payment options */}
        {step === "payment" && selectedPackage && (
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Choose payment method
            </h1>
            <p className="mt-2 text-gray-600">
              Pay {selectedPackage.price} GEL for {selectedPackage.label}. Package valid for 1 year.
            </p>
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => handlePaymentMethod("invoice")}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-gray-200 p-5 text-left transition hover:border-matcher hover:bg-matcher-pale"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">📄</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">Pay by invoice</span>
                  <p className="mt-0.5 text-sm text-gray-500">
                    We&apos;ll send an invoice to your email. Pay by bank transfer.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handlePaymentMethod("card")}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-gray-200 p-5 text-left transition hover:border-matcher hover:bg-matcher-pale"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">💳</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">Pay by card</span>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Secure online payment with Visa or Mastercard.
                  </p>
                </div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("package")}
              className="mt-6 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Back to packages
            </button>
          </div>
        )}

        {/* Step: Vacancy form */}
        {step === "vacancy" && (
        <>
        {fromRegistration && (
          <div className="mb-6 rounded-2xl border border-matcher bg-matcher-mint p-4 text-center">
            <p className="font-semibold text-matcher-dark">You&apos;re registered!</p>
            <p className="mt-1 text-sm text-matcher-dark/90">
              Add your first vacancy to start matching with candidates.
            </p>
          </div>
        )}
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Post a vacancy
          </h1>
          <p className="mt-2 text-gray-600">
            {fromRegistration
              ? "Fill in the job details below. Candidates swipe to match — you'll be notified of mutual matches."
              : "No registration needed. Fill in the job details. Candidates swipe to match — you'll be notified of mutual matches."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="relative">
              <label className="text-sm font-medium text-gray-900">Job title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => handleJobTitleChange(e.target.value)}
                onFocus={() => setJobTitleFocused(true)}
                onBlur={() => setTimeout(() => setJobTitleFocused(false), 150)}
                placeholder="Type to see suggestions or enter your own (e.g. Barista, Chef…)"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              />
              {showJobDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-2xl border bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
                  {filteredJobs.map((role) => (
                    <button
                      key={role.slug}
                      type="button"
                      onClick={() => handleJobTitleSelect(role)}
                      className={classNames(
                        "w-full px-4 py-2.5 text-left text-sm hover:bg-matcher-mint",
                        jobTitle === role.title && "bg-matcher-mint font-medium"
                      )}
                    >
                      {role.title}
                    </button>
                  ))}
                </div>
              )}
              {jobTitleFocused && jobTitle.trim().length >= 2 && filteredJobs.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-500">
                  No suggestions — you can use your own job title.
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Location (city)</label>
              <select
                value={locationCityId}
                onChange={(e) => {
                  setLocationCityId(e.target.value);
                  setLocationDistrictId("");
                }}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              >
                <option value="">Select city</option>
                {GEORGIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {selectedCity?.districts && selectedCity.districts.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-900">
                  District (optional) — {selectedCity.nameEn}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setLocationDistrictId("")}
                    className={classNames(
                      "rounded-full border px-3 py-1.5 text-xs transition",
                      !locationDistrictId
                        ? "border-matcher bg-matcher-mint text-matcher-dark"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    Any
                  </button>
                  {selectedCity.districts.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setLocationDistrictId(d.id)}
                      className={classNames(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        locationDistrictId === d.id
                          ? "border-matcher bg-matcher-mint text-matcher-dark"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {d.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-900">Do you require experience?</label>
              <p className="mt-1 text-xs text-gray-500">
                Candidates without experience can still apply if you choose &quot;No&quot;.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setExperienceRequired("yes")}
                  className={classNames(
                    "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    experienceRequired === "yes"
                      ? "border-matcher bg-matcher-mint text-matcher-dark"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setExperienceRequired("no")}
                  className={classNames(
                    "flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                    experienceRequired === "no"
                      ? "border-matcher bg-matcher-mint text-matcher-dark"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  No
                </button>
              </div>
              {experienceRequired === "yes" && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-900">Minimum experience</label>
                  <select
                    value={requiredExperienceMonths}
                    onChange={(e) => setRequiredExperienceMonths(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  >
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={12}>1 year</option>
                    <option value={24}>2 years</option>
                    <option value={36}>3 years</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Skills</label>
              <p className="mt-1 text-xs text-gray-500">
                Add required skills (1–5) for matching. Good-to-have is optional. Tap a skill to add it.
              </p>

              <div className="mt-3 flex gap-2 rounded-xl bg-gray-100 p-2">
                <button
                  type="button"
                  onClick={() => setAddingAsRequired(true)}
                  className={classNames(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                    addingAsRequired
                      ? "bg-white text-matcher-dark shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Required
                </button>
                <button
                  type="button"
                  onClick={() => setAddingAsRequired(false)}
                  className={classNames(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                    !addingAsRequired
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Good to have
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedSkills.map((s) => {
                  const inRequired = requiredSkills.some((x) => x.name === s);
                  const inGood = goodToHaveSkills.some((x) => x.name === s);
                  const added = inRequired || inGood;
                  const canAdd = addingAsRequired
                    ? requiredSkills.length < 5 && !added
                    : goodToHaveSkills.length < 5 && !added;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      disabled={!canAdd}
                      className={classNames(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        inRequired && "border-matcher bg-matcher-mint text-matcher-dark",
                        inGood && "border-gray-400 bg-gray-100 text-gray-700",
                        !added && "border-gray-200 hover:bg-gray-50",
                        !canAdd && !added && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {(requiredSkills.length > 0 || goodToHaveSkills.length > 0) && (
                <div className="mt-4 space-y-3">
                  {requiredSkills.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-matcher-dark">Required ({requiredSkills.length}/5)</p>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((sk) => (
                          <div
                            key={sk.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-matcher bg-matcher-mint px-3 py-1.5 text-sm"
                          >
                            <span className="font-medium text-gray-900">{sk.name}</span>
                            <select
                              value={sk.level ?? "Intermediate"}
                              onChange={(e) => setSkillLevel(sk.name, e.target.value as SkillLevel, true)}
                              className="rounded-full border-0 bg-white/80 py-0.5 pr-6 pl-2 text-xs outline-none focus:ring-1 focus:ring-matcher/500"
                            >
                              {SKILL_LEVELS.map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => moveSkill(sk.name, true)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                              title="Move to Good to have"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSkill(sk.name, true)}
                              className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-red-100 hover:text-red-600"
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {goodToHaveSkills.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-600">Good to have ({goodToHaveSkills.length}/5)</p>
                      <div className="flex flex-wrap gap-2">
                        {goodToHaveSkills.map((sk) => (
                          <div
                            key={sk.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
                          >
                            <span className="font-medium text-gray-900">{sk.name}</span>
                            <select
                              value={sk.level ?? "Intermediate"}
                              onChange={(e) => setSkillLevel(sk.name, e.target.value as SkillLevel, false)}
                              className="rounded-full border-0 bg-white/80 py-0.5 pr-6 pl-2 text-xs outline-none focus:ring-1 focus:ring-gray-400"
                            >
                              {SKILL_LEVELS.map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => moveSkill(sk.name, false)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                              title="Move to Required"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSkill(sk.name, false)}
                              className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-red-100 hover:text-red-600"
                              aria-label="Remove"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-900">Salary min (GEL)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="e.g. 1000"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900">Salary max (GEL)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="e.g. 1500"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Description</label>
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated. Edit if needed. Two sentences max.
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder="Brief description of the role..."
                rows={3}
                maxLength={200}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              />
              <p className="mt-1 text-xs text-gray-500">{description.length}/200 · 2 sentences max</p>
            </div>

            {!isLoggedIn && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">Your contact details</p>
              <p className="mt-1 text-xs text-gray-500">
                For notifications when you get mutual matches. No account needed.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900">Contact name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Nino from HR"
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/600/30 ${
                      contactName.length > 0 && contactName.trim().length < 2
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                  />
                  {contactName.length > 0 && contactName.trim().length < 2 && (
                    <p className="mt-2 text-xs text-red-600">Enter at least 2 characters.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hr@company.ge"
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/600/30 ${
                      contactEmail.length > 0 && !isValidEmail(contactEmail)
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                  />
                  {contactEmail.length > 0 && !isValidEmail(contactEmail) && (
                    <p className="mt-2 text-xs text-red-600">Please enter a valid email.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+995 5xx xx xx xx"
                    className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/600/30 ${
                      contactPhone.length > 0 && !isValidPhone(contactPhone)
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                  />
                  {contactPhone.length > 0 && !isValidPhone(contactPhone) && (
                    <p className="mt-2 text-xs text-red-600">Please enter a valid phone number.</p>
                  )}
                </div>
              </div>
            </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                canSubmit
                  ? "bg-matcher text-white hover:bg-matcher-dark"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Post vacancy
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Want to manage multiple vacancies?{" "}
            <Link href="/employer/register" className="font-medium text-matcher-dark hover:text-matcher">
              Register your company
            </Link>
          </p>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
