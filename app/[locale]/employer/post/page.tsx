"use client";

import { useState, useMemo, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { GEORGIAN_CITIES } from "@/lib/georgianLocations";
import Logo from "@/components/Logo";
import { fetchJobTemplates, getRecommendedSalaryForSlug, getRecommendedSalaryForTitle, getRecommendedSalaryForTitleWithAverages, getSkillNamesFromRole, type JobTemplateRole } from "@/lib/jobTemplates";
import { getStockPhotosForJob } from "@/lib/vacancyStockPhotos";
import { addSkillToDb, createJobRoleInDb } from "@/lib/userContentApi";
import { ALL_SKILLS } from "@/lib/allSkills";

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

type Step = "vacancy" | "vacancySaved" | "package" | "payment" | "success";

export default function EmployerPostPage() {
  const locale = useLocale();
  const apiLocale = (locale === "local" ? "en" : locale) as "en" | "ka";
  const t = useTranslations("employerPost");
  const tCommon = useTranslations("common");
  const tSkillNames = useTranslations("skillNames");
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
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("employerLoggedIn")) {
      setIsLoggedIn(true);
      const userId = window.sessionStorage.getItem("matcher_employer_user_id");
      const companyId = window.sessionStorage.getItem("matcher_employer_company_id");
      if (userId && companyId) return;
      fetch("/api/auth/session", { credentials: "include" })
        .then((r) => r.json())
        .then((data: { user?: { id: string; role: string } | null }) => {
          if (data?.user?.role === "EMPLOYER" && data.user.id) {
            window.sessionStorage.setItem("matcher_employer_user_id", data.user.id);
            if (!window.sessionStorage.getItem("matcher_employer_company_id")) {
              return fetch(`/api/companies?userId=${encodeURIComponent(data.user.id)}`)
                .then((r) => r.json())
                .then((company: { id?: string } | null) => {
                  if (company?.id) window.sessionStorage.setItem("matcher_employer_company_id", company.id);
                })
                .catch(() => {});
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchJobTemplates(apiLocale).then(setJobRoles).catch(() => setJobRoles([]));
  }, [locale]);

  const [salaryAveragesFromCandidates, setSalaryAveragesFromCandidates] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    fetch("/api/salaries/average")
      .then((r) => r.json())
      .then((data: { bySlug?: Record<string, number> }) => setSalaryAveragesFromCandidates(data?.bySlug ?? null))
      .catch(() => setSalaryAveragesFromCandidates(null));
  }, []);

  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(() => {
      router.push("/employer/cabinet");
    }, 3000);
    return () => clearTimeout(t);
  }, [step, router]);

  const [jobTitle, setJobTitle] = useState("");
  const [jobSlug, setJobSlug] = useState<string | null>(null);
  const [jobTitleFocused, setJobTitleFocused] = useState(false);

  const selectedRole = useMemo(
    () => (jobSlug ? jobRoles.find((r) => r.slug === jobSlug) ?? null : jobRoles.find((r) => r.title === jobTitle) ?? null),
    [jobSlug, jobTitle, jobRoles]
  );
  const recommendedSalary = useMemo(() => {
    const fromCandidates = (slug: string) =>
      salaryAveragesFromCandidates != null && typeof salaryAveragesFromCandidates[slug] === "number"
        ? salaryAveragesFromCandidates[slug]
        : getRecommendedSalaryForSlug(slug);
    if (selectedRole?.slug != null) return fromCandidates(selectedRole.slug);
    if (jobSlug) return fromCandidates(jobSlug);
    return getRecommendedSalaryForTitleWithAverages(jobTitle, salaryAveragesFromCandidates);
  }, [selectedRole?.slug, jobSlug, jobTitle, salaryAveragesFromCandidates]);
  const [locationCityId, setLocationCityId] = useState("");
  const [locationDistrictId, setLocationDistrictId] = useState("");

  const selectedCity = useMemo(
    () => GEORGIAN_CITIES.find((c) => c.id === locationCityId) ?? null,
    [locationCityId]
  );
  const [experienceRequired, setExperienceRequired] = useState<"yes" | "no">("no");
  const [requiredEducationLevel, setRequiredEducationLevel] = useState<"None" | "High School" | "Bachelor" | "Master" | "PhD">("High School");
  const [requiredExperienceMonths, setRequiredExperienceMonths] = useState(6);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<VacancySkill[]>([]);
  const [goodToHaveSkills, setGoodToHaveSkills] = useState<VacancySkill[]>([]);
  const [addingAsRequired, setAddingAsRequired] = useState(true);
  const [description, setDescription] = useState("");
  const [salaryConfirmOpen, setSalaryConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vacancyPhotoUrl, setVacancyPhotoUrl] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");

  const stockPhotos = useMemo(
    () => getStockPhotosForJob(selectedRole?.slug ?? jobSlug ?? jobTitle ?? null),
    [selectedRole?.slug, jobSlug, jobTitle]
  );
  const effectivePhotoUrl = customPhotoUrl.trim() || vacancyPhotoUrl || stockPhotos[0] || "";

  const filteredJobs = useMemo(() => {
    const q = jobTitle.trim().toLowerCase();
    if (q.length < 2) return [];
    return jobRoles.filter((r) => r.title.toLowerCase().includes(q));
  }, [jobTitle, jobRoles]);

  const showJobDropdown = jobTitleFocused && jobTitle.trim().length >= 2 && filteredJobs.length > 0;

  const suggestedSkills = useMemo(() => {
    const names = getSkillNamesFromRole(selectedRole);
    return names.length > 0 ? names : FALLBACK_SKILLS;
  }, [selectedRole]);

  const skillLabel = (s: string) => (ALL_SKILLS.includes(s) ? (tSkillNames(s) as string) : s);

  const [skillSearch, setSkillSearch] = useState("");
  const [showAddSkillInput, setShowAddSkillInput] = useState(false);
  const filteredSkillsForSearch = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (q.length < 2) return [];
    const inRequired = new Set(requiredSkills.map((s) => s.name));
    const inGood = new Set(goodToHaveSkills.map((s) => s.name));
    return ALL_SKILLS.filter((s) => {
      if (inRequired.has(s) || inGood.has(s)) return false;
      const canAdd = addingAsRequired ? requiredSkills.length < 5 : goodToHaveSkills.length < 5;
      if (!canAdd) return false;
      return s.toLowerCase().includes(q);
    }).slice(0, 12);
  }, [skillSearch, requiredSkills, goodToHaveSkills, addingAsRequired]);

  function addSkill(s: string) {
    const name = s.trim();
    if (!name || name.length < 2) return;
    const displayName = name.replace(/\b\w/g, (c) => c.toUpperCase());
    const inRequired = requiredSkills.some((x) => x.name.toLowerCase() === displayName.toLowerCase());
    const inGood = goodToHaveSkills.some((x) => x.name.toLowerCase() === displayName.toLowerCase());
    if (inRequired || inGood) return;
    const skill: VacancySkill = { name: displayName, level: "Intermediate" };
    const canonical = ALL_SKILLS.find((x) => x.toLowerCase() === displayName.toLowerCase());
    const finalName = canonical ?? displayName;
    if (addingAsRequired && requiredSkills.length < 5) {
      setRequiredSkills((prev) => [...prev, { ...skill, name: finalName }]);
      addSkillToDb(finalName);
    } else if (!addingAsRequired && goodToHaveSkills.length < 5) {
      setGoodToHaveSkills((prev) => [...prev, { ...skill, name: finalName }]);
      addSkillToDb(finalName);
    }
  }

  function addCustomSkillEmployer() {
    const raw = skillSearch.trim();
    if (raw.length < 2) return;
    addSkill(raw);
    setSkillSearch("");
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
    setVacancyPhotoUrl("");
  }

  function handleJobTitleChange(value: string) {
    setJobTitle(value);
    const match = jobRoles.find((r) => r.title === value);
    if (match) {
      setJobSlug(match.slug);
      setDescription(match.description);
      setRequiredSkills([]);
      setGoodToHaveSkills([]);
      setVacancyPhotoUrl("");
    } else {
      setJobSlug(null);
      setVacancyPhotoUrl("");
    }
  }

  const canSubmit =
    isLoggedIn &&
    jobTitle.trim().length >= 2 &&
    requiredSkills.length > 0 &&
    requiredSkills.every((s) => Boolean(s.level)) &&
    locationCityId;

  async function proceedToPackage() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!selectedRole && jobTitle.trim().length >= 2) {
      const levelToWeight = (l: string) => (l === "Advanced" ? 5 : l === "Intermediate" ? 4 : 3);
      const skillsPayload = [
        ...requiredSkills.map((s) => ({ skillName: s.name, weight: levelToWeight(s.level ?? "Intermediate") })),
        ...goodToHaveSkills.map((s) => ({ skillName: s.name, weight: levelToWeight(s.level ?? "Intermediate") })),
      ];
      await createJobRoleInDb({
        title: jobTitle.trim(),
        locale: apiLocale,
        category: "User-added",
        description: description.trim() || undefined,
        skills: skillsPayload.length > 0 ? skillsPayload : undefined,
      });
    }

    const levelToWeight = (l?: string) => (l === "Advanced" ? 5 : l === "Intermediate" ? 4 : 3);
    const skillsForApi = [
      ...requiredSkills.map((s) => ({
        name: s.name,
        level: s.level ?? "Intermediate",
        weight: levelToWeight(s.level),
        isRequired: true,
      })),
      ...goodToHaveSkills.map((s) => ({
        name: s.name,
        level: s.level ?? "Intermediate",
        weight: levelToWeight(s.level),
        isRequired: false,
      })),
    ];
    const salMin = salaryMin.trim() ? parseInt(salaryMin.replace(/\D/g, ""), 10) : null;
    const salMax = salaryMax.trim() ? parseInt(salaryMax.replace(/\D/g, ""), 10) : 1200;
    let companyId = typeof window !== "undefined" ? window.sessionStorage.getItem("matcher_employer_company_id") : null;
    let userId = typeof window !== "undefined" ? window.sessionStorage.getItem("matcher_employer_user_id") : null;
    if (typeof window !== "undefined" && !userId) {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include" });
        const sessionData = await sessionRes.json().catch(() => ({}));
        if (sessionData?.user?.role === "EMPLOYER" && sessionData.user.id) {
          const id = String(sessionData.user.id);
          userId = id;
          window.sessionStorage.setItem("matcher_employer_user_id", id);
        }
      } catch {
        // ignore
      }
    }
    if (!companyId && userId && typeof window !== "undefined") {
      try {
        const companyRes = await fetch(`/api/companies?userId=${encodeURIComponent(userId)}`);
        const companyData = await companyRes.json().catch(() => null);
        if (companyData?.id) {
          companyId = companyData.id;
          window.sessionStorage.setItem("matcher_employer_company_id", companyData.id);
        }
      } catch {
        // ignore
      }
    }
    try {
      const res = await fetch("/api/vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyId: companyId || undefined,
          userId: userId || undefined,
          companyName: jobTitle.trim() || undefined,
          title: jobTitle.trim(),
          locationCityId,
          locationDistrictId: locationDistrictId || undefined,
          salaryMin: salMin ?? undefined,
          salaryMax: salMax,
          workType: "Full-time",
          isRemote: false,
          requiredExperienceMonths: experienceRequired === "yes" ? requiredExperienceMonths : 0,
          requiredEducationLevel,
          description: description.trim() || undefined,
          skills: skillsForApi,
          photo: effectivePhotoUrl || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Could not save vacancy. Please try again.";
        setSaveError(msg);
        if (res.status === 401 && typeof window !== "undefined") {
          window.sessionStorage.removeItem("employerLoggedIn");
          window.sessionStorage.removeItem("matcher_employer_user_id");
          window.sessionStorage.removeItem("matcher_employer_company_id");
          setIsLoggedIn(false);
        }
        return;
      }
      setSaveError(null);
      if (typeof window !== "undefined") {
        if (data.companyId) window.sessionStorage.setItem("matcher_employer_company_id", data.companyId);
        if (data.userId) window.sessionStorage.setItem("matcher_employer_user_id", data.userId);
      }
      setStep("vacancySaved");
    } catch (e) {
      console.warn("Failed to save vacancy to database", e);
      setSaveError("Could not save vacancy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    const minSal = salaryMin.trim() ? parseInt(salaryMin.replace(/\D/g, ""), 10) : NaN;
    const maxSal = salaryMax.trim() ? parseInt(salaryMax.replace(/\D/g, ""), 10) : NaN;
    const offerBelowRecommended =
      (!isNaN(minSal) && minSal < recommendedSalary) || (!isNaN(maxSal) && maxSal < recommendedSalary);
    if (offerBelowRecommended) {
      setSalaryConfirmOpen(true);
      return;
    }
    await proceedToPackage();
  }

  function handlePackageSelect(pkg: (typeof PACKAGES)[number]) {
    setSelectedPackage(pkg);
    setStep("payment");
  }

  async function handlePaymentMethod(method: "invoice" | "card") {
    setPaymentMethod(method);
    setPaymentError(null);
    if (!selectedPackage) {
      setPaymentError("Please select a package first.");
      return;
    }
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          packageType: selectedPackage.id,
          pricePaid: selectedPackage.price,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPaymentError(typeof data?.error === "string" ? data.error : "Could not complete purchase.");
        return;
      }
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("employerHasSubscription", "1");
        if (data.companyId) window.sessionStorage.setItem("matcher_employer_company_id", data.companyId);
      }
      setStep("success");
    } catch (e) {
      console.warn("Subscription error", e);
      setPaymentError("Could not complete purchase. Please try again.");
    }
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
            {tCommon("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-16">
        {/* Step: Vacancy saved — success */}
        {step === "vacancySaved" && (
          <div className="rounded-3xl border-2 border-matcher/30 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-matcher-mint text-4xl text-matcher-dark">
                ✓
              </div>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
                {t("vacancySavedTitle")}
              </h1>
              <p className="mt-3 text-gray-600">
                {t("vacancySavedMessage")}
              </p>
              <button
                type="button"
                onClick={() => setStep("package")}
                className="mt-8 rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
              >
                {t("vacancySavedContinue")}
              </button>
            </div>
          </div>
        )}

        {/* Step: Package selection */}
        {step === "package" && (
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            {saveError && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {saveError}
              </div>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {t("choosePackage")}
            </h1>
            <p className="mt-2 text-gray-600">
              {t("packageReady")}
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
                      {pkg.vacancies === -1 ? t("postAsMany") : t("vacancySlots", { count: pkg.vacancies })}
                    </p>
                  </div>
                  <span className="text-xl font-bold text-matcher-dark">{pkg.price} GEL</span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              {t("packageExpires")}
            </p>
            <button
              type="button"
              onClick={() => { setSaveError(null); setStep("vacancy"); }}
              className="mt-6 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("backToVacancy")}
            </button>
          </div>
        )}

        {/* Step: Success — redirect to cabinet */}
        {step === "success" && (
          <div className="rounded-3xl border-2 border-matcher/30 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-matcher-mint text-4xl">
                ✓
              </div>
              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
                {paymentMethod === "invoice" ? t("invoiceOnTheWay") : t("paymentSuccessful")}
              </h1>
              <p className="mt-3 text-gray-600">
                {paymentMethod === "invoice" ? t("invoiceMessage") : t("vacancyLive")}
              </p>
              <button
                type="button"
                onClick={handleGoToCabinet}
                className="mt-8 rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
              >
                {tCommon("goToCabinet")}
              </button>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to your cabinet in a few seconds…
              </p>
            </div>
          </div>
        )}

        {/* Step: Payment options */}
        {step === "payment" && selectedPackage && (
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {t("choosePayment")}
            </h1>
            <p className="mt-2 text-gray-600">
              {t("payForPackage", { price: selectedPackage.price, label: selectedPackage.label })}
            </p>
            {paymentError && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {paymentError}
              </p>
            )}
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => handlePaymentMethod("invoice")}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-gray-200 p-5 text-left transition hover:border-matcher hover:bg-matcher-pale"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">📄</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">{t("payByInvoice")}</span>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t("invoiceDesc")}
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
                  <span className="font-semibold text-gray-900">{t("payByCard")}</span>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t("cardDesc")}
                  </p>
                </div>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("package")}
              className="mt-6 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("backToPackages")}
            </button>
          </div>
        )}

        {/* Step: Vacancy form */}
        {step === "vacancy" && (
        <>
        {fromRegistration && (
          <div className="mb-6 rounded-2xl border border-matcher bg-matcher-mint p-4 text-center">
            <p className="font-semibold text-matcher-dark">{t("youRegistered")}</p>
            <p className="mt-1 text-sm text-matcher-dark/90">
              {t("addFirstVacancy")}
            </p>
          </div>
        )}
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("postVacancy")}
          </h1>
          {!isLoggedIn ? (
            <div className="mt-6 rounded-2xl border border-matcher/30 bg-matcher-mint/50 p-8 text-center">
              <p className="text-gray-700">{t("registerToPost")}</p>
              <Link
                href="/employer/register"
                className="mt-4 inline-block rounded-2xl bg-matcher px-6 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
              >
                {t("registerCompany")}
              </Link>
            </div>
          ) : (
          <>
          <p className="mt-2 text-gray-600">
            {fromRegistration ? t("fromRegistrationIntro") : t("vacancyIntro")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="relative">
              <label className="text-sm font-medium text-gray-900">{t("jobTitle")}</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => handleJobTitleChange(e.target.value)}
                onFocus={() => setJobTitleFocused(true)}
                onBlur={() => setTimeout(() => setJobTitleFocused(false), 150)}
                placeholder={t("jobTitlePlaceholder")}
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
                  {t("noSuggestions")}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("locationCity")}</label>
              <select
                value={locationCityId}
                onChange={(e) => {
                  setLocationCityId(e.target.value);
                  setLocationDistrictId("");
                }}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              >
                <option value="">{t("selectCity")}</option>
                {GEORGIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border-2 border-matcher/30 bg-matcher-mint/30 p-4">
              <p className="text-sm font-semibold text-matcher-dark">
                {selectedRole || jobTitle.trim()
                  ? t("salaryRecommendation", { amount: recommendedSalary.toLocaleString() })
                  : t("salaryRecommendationGeneric", { amount: recommendedSalary.toLocaleString() })}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSalaryMin(String(recommendedSalary));
                  setSalaryMax(String(Math.round(recommendedSalary * 1.2)));
                }}
                className="mt-2 text-sm font-medium text-matcher-dark underline hover:no-underline"
              >
                {t("useRecommendation")}
              </button>
            </div>

            {selectedCity?.districts && selectedCity.districts.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-900">
                  {t("districtOptional")} — {selectedCity.nameEn}
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
                    {t("any")}
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
              <label className="text-sm font-medium text-gray-900">{t("vacancyPhoto")}</label>
              <p className="mt-1 text-xs text-gray-500">{t("vacancyPhotoHint")}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {stockPhotos.slice(0, 8).map((url) => {
                  const selected = !customPhotoUrl.trim() && (vacancyPhotoUrl === url || (vacancyPhotoUrl === "" && url === stockPhotos[0]));
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => { setVacancyPhotoUrl(url); setCustomPhotoUrl(""); }}
                      className={classNames(
                        "relative aspect-square overflow-hidden rounded-xl border-2 bg-gray-100 transition",
                        selected ? "border-matcher ring-2 ring-matcher/30" : "border-gray-200 hover:border-matcher/50"
                      )}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      {selected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-matcher text-xs text-white">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-600">{t("useMyOwnImage")}</label>
                <input
                  type="url"
                  value={customPhotoUrl}
                  onChange={(e) => { setCustomPhotoUrl(e.target.value); if (e.target.value.trim()) setVacancyPhotoUrl(""); }}
                  placeholder={t("useMyOwnImagePlaceholder")}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                />
              </div>
            </div>

            {/* Preview: how this vacancy looks in the candidate swipe deck */}
            <div className="rounded-2xl border-2 border-dashed border-matcher/30 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-matcher-dark">
                {t("deckPreviewTitle")}
              </p>
              <div className="mx-auto max-w-[280px] overflow-hidden rounded-2xl bg-gray-900 shadow-lg ring-2 ring-white/20">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
                  <img
                    src={effectivePhotoUrl || stockPhotos[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2 rounded-full bg-matcher-bright px-2.5 py-1 text-xs font-bold tracking-tight text-charcoal">
                    {salaryMin.trim() && salaryMax.trim()
                      ? `${salaryMin.replace(/\D/g, "")}–${salaryMax.replace(/\D/g, "")} GEL`
                      : salaryMax.trim()
                        ? `${salaryMax.replace(/\D/g, "")} GEL`
                        : "—"}
                  </div>
                </div>
                <div className="flex flex-col gap-1 p-3 text-white">
                  <h3 className="font-heading text-lg font-bold leading-tight">
                    {jobTitle.trim() || t("deckPreviewJobPlaceholder")}
                  </h3>
                  <p className="text-sm text-white/90">{t("deckPreviewCompany")}</p>
                  <p className="text-xs text-white/80">
                    {locationCityId ? (GEORGIAN_CITIES.find((c) => c.id === locationCityId)?.nameEn ?? locationCityId) : "—"} · Full-time
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("educationRequired")}</label>
              <select
                value={requiredEducationLevel}
                onChange={(e) => setRequiredEducationLevel(e.target.value as typeof requiredEducationLevel)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              >
                <option value="None">{t("educationNone")}</option>
                <option value="High School">{t("educationHighSchool")}</option>
                <option value="Bachelor">{t("educationBachelor")}</option>
                <option value="Master">{t("educationMaster")}</option>
                <option value="PhD">{t("educationPhd")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("requireExperience")}</label>
              <p className="mt-1 text-xs text-gray-500">
                {t("experienceHint")}
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
                  {t("yes")}
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
                  {t("no")}
                </button>
              </div>
              {experienceRequired === "yes" && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-900">{t("minExperience")}</label>
                  <select
                    value={requiredExperienceMonths}
                    onChange={(e) => setRequiredExperienceMonths(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  >
                    <option value={3}>{t("months", { n: 3 })}</option>
                    <option value={6}>{t("months", { n: 6 })}</option>
                    <option value={12}>{t("oneYear")}</option>
                    <option value={24}>{t("twoYears")}</option>
                    <option value={36}>{t("threeYears")}</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("skills")}</label>
              <p className="mt-1 text-xs text-gray-500">
                {t("skillsHint")}
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
                  {t("required")}
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
                  {t("goodToHave")}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 items-center">
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
                      {skillLabel(s)}
                    </button>
                  );
                })}
                {((addingAsRequired && requiredSkills.length < 5) || (!addingAsRequired && goodToHaveSkills.length < 5)) && !showAddSkillInput && (
                  <button
                    type="button"
                    onClick={() => setShowAddSkillInput(true)}
                    className="rounded-full border-2 border-dashed border-matcher-teal bg-matcher-teal/10 px-3 py-1.5 text-xs font-medium text-matcher-teal hover:bg-matcher-teal/20 hover:border-matcher-teal"
                  >
                    + {t("addYourSkill")}
                  </button>
                )}
                {((addingAsRequired && requiredSkills.length < 5) || (!addingAsRequired && goodToHaveSkills.length < 5)) && showAddSkillInput && (
                  <div className="relative inline-flex items-center gap-1.5">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSkillEmployer();
                        }
                        if (e.key === "Escape") setShowAddSkillInput(false);
                      }}
                      placeholder={t("searchSkillsPlaceholder")}
                      className="rounded-full border border-matcher bg-matcher-pale px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-matcher/30 w-48"
                      autoFocus
                    />
                    {(skillSearch.trim().length >= 2 &&
                      (filteredSkillsForSearch.length > 0 ||
                        (!requiredSkills.some((x) => x.name.toLowerCase() === skillSearch.trim().toLowerCase()) &&
                          !goodToHaveSkills.some((x) => x.name.toLowerCase() === skillSearch.trim().toLowerCase())))) && (
                      <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-2xl border border-gray-200 bg-white py-1 shadow-xl max-h-48 overflow-y-auto" onMouseDown={(e) => e.preventDefault()}>
                        {filteredSkillsForSearch.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { addSkill(s); setSkillSearch(""); setShowAddSkillInput(false); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-matcher-mint"
                          >
                            {skillLabel(s)}
                          </button>
                        ))}
                        {!requiredSkills.some((x) => x.name.toLowerCase() === skillSearch.trim().toLowerCase()) &&
                          !goodToHaveSkills.some((x) => x.name.toLowerCase() === skillSearch.trim().toLowerCase()) &&
                          !filteredSkillsForSearch.some((s) => s.toLowerCase() === skillSearch.trim().toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => { addCustomSkillEmployer(); setShowAddSkillInput(false); }}
                              className="w-full px-4 py-2 text-left text-sm text-matcher-dark hover:bg-matcher-mint border-t border-gray-100"
                            >
                              {t("addCustomSkill", { skill: skillSearch.trim() })}
                            </button>
                          )}
                      </div>
                    )}
                    <button type="button" onClick={() => { setShowAddSkillInput(false); setSkillSearch(""); }} className="text-gray-500 hover:text-gray-700">×</button>
                  </div>
                )}
              </div>

              {(requiredSkills.length > 0 || goodToHaveSkills.length > 0) && (
                <div className="mt-4 space-y-3">
                  {requiredSkills.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-matcher-dark">{t("requiredCount", { count: requiredSkills.length })}</p>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((sk) => (
                          <div
                            key={sk.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-matcher bg-matcher-mint px-3 py-1.5 text-sm"
                          >
                            <span className="font-medium text-gray-900">{skillLabel(sk.name)}</span>
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
                      <p className="mb-2 text-xs font-medium text-gray-600">{t("goodToHaveCount", { count: goodToHaveSkills.length })}</p>
                      <div className="flex flex-wrap gap-2">
                        {goodToHaveSkills.map((sk) => (
                          <div
                            key={sk.name}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
                          >
                            <span className="font-medium text-gray-900">{skillLabel(sk.name)}</span>
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
                <label className="text-sm font-medium text-gray-900">{t("salaryMin")}</label>
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
                <label className="text-sm font-medium text-gray-900">{t("salaryMax")}</label>
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
              <label className="text-sm font-medium text-gray-900">{t("description")}</label>
              <p className="mt-1 text-xs text-gray-500">
                {t("descriptionHint")}
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
                maxLength={200}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              />
              <p className="mt-1 text-xs text-gray-500">{t("charactersMax", { count: description.length })}</p>
            </div>

            {saveError && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </p>
            )}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              onClick={() => setSaveError(null)}
              className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                canSubmit && !isSubmitting
                  ? "bg-matcher text-white hover:bg-matcher-dark"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? tCommon("saving") || "Saving…" : t("postVacancy")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("wantManageMultiple")}{" "}
            <Link href="/employer/register" className="font-medium text-matcher-dark hover:text-matcher">
              {t("registerCompany")}
            </Link>
          </p>
          </>
          )}
        </div>
        </>
        )}
      </main>

      {/* Salary below recommended — confirm to continue */}
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
                disabled={isSubmitting}
                onClick={() => {
                  setSalaryConfirmOpen(false);
                  proceedToPackage();
                }}
                className="flex-1 rounded-2xl bg-matcher px-4 py-3 text-sm font-semibold text-white hover:bg-matcher-dark disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (tCommon("saving") || "Saving…") : tCommon("salaryConfirmContinue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
