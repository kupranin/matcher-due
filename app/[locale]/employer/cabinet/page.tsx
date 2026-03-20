"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from "framer-motion";
import { buildCandidateCardsWithMatch } from "@/lib/vacancyApi";
import { apiVacancyToProfile } from "@/lib/vacancyApi";
import { getRecommendedSalaryForTitle } from "@/lib/jobTemplates";
import type { MutualMatch } from "@/lib/matchStorage";
import MatchCongratulationsModal from "@/components/MatchCongratulationsModal";

type EmployerVacancy = {
  id: string;
  title: string;
  location: string;
  workType: string;
  salary: string;
  company: string;
  profile: import("@/lib/matchCalculation").VacancyProfile;
};
type Candidate = import("@/lib/matchMockData").CandidateCard & {
  match: number;
  age?: number | null;
  matchedSkills?: string[];
};

function CandidateCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-full bg-gray-200/80 animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-16 w-16 rounded-2xl bg-gray-200/80 animate-pulse" />
        <div className="h-5 w-40 rounded-lg bg-gray-200/80 animate-pulse" />
        <div className="h-3 w-28 rounded bg-gray-200/80 animate-pulse" />
        <div className="h-3 w-36 rounded bg-gray-200/80 animate-pulse" />
        <div className="flex gap-2 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 w-12 rounded-full bg-gray-200/80 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-full bg-gray-200/80 animate-pulse" />
        <div className="h-9 flex-1 rounded-full bg-gray-200/80 animate-pulse" />
      </div>
    </div>
  );
}

const AVATAR_PLACEHOLDER = "/images/avatar-placeholder.svg";
const SWIPE_THRESHOLD = 100;
const STORAGE_KEY_SELECTED_VACANCY_ID = "matcher_employer_selected_vacancy_id";

function SwipeCard({
  candidate,
  vacancyTitle,
  companyName,
  onSwipe,
}: {
  candidate: Candidate;
  vacancyTitle: string;
  companyName: string;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const t = useTranslations("cabinet");
  const tPage = useTranslations("employerCabinetPage");
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [0, 60, SWIPE_THRESHOLD], [0, 0.4, 1]);
  const nopeOpacity = useTransform(x, [-220, -100, 0], [1, 0.4, 0]);
  const bgLeftOpacity = useTransform(x, [0, -120], [0, 0.2]);
  const bgRightOpacity = useTransform(x, [120, 0], [0.2, 0]);
  const photoSrc = candidate.photo && candidate.photo.trim() ? candidate.photo.trim() : AVATAR_PLACEHOLDER;
  const [firstName, ...restName] = (candidate.name || "").split(" ");
  const lastInitial = restName[0]?.[0] ? `${restName[0][0]}.` : "";

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 280, damping: 28 });
  }

  const matchedSkills = Array.isArray(candidate.matchedSkills)
    ? candidate.matchedSkills.filter((s) => typeof s === "string" && s.trim().length > 0).slice(0, 5)
    : [];

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
    >
      <div className="pointer-events-none absolute -inset-3 z-0 flex overflow-hidden rounded-[1.4rem]">
        <motion.div style={{ opacity: bgLeftOpacity }} className="flex-1 bg-rose-400/30" aria-hidden />
        <motion.div style={{ opacity: bgRightOpacity }} className="flex-1 bg-emerald-400/30" aria-hidden />
      </div>
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Hero image section */}
        <div className="relative w-full h-56 sm:h-64 bg-matcher-pale">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={candidate.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = AVATAR_PLACEHOLDER;
              }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-matcher-pale text-matcher-dark">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-2xl font-semibold shadow">
                {(firstName && firstName[0]) || "👤"}
              </div>
              <p className="mt-2 text-xs font-medium text-gray-500">No photo</p>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {firstName || candidate.name || "Candidate"} {lastInitial}
            </h2>
            {typeof candidate.age === "number" && candidate.age > 0 && (
              <div className="font-bold text-gray-900">
                {candidate.age}{" "}
                <span className="font-normal text-gray-800">years old</span>
              </div>
            )}
            <p className="text-matcher-dark font-medium">
              {candidate.job || "Not specified"}
            </p>
            <p className="text-sm text-gray-500">
              {candidate.location || "-"}
              {candidate.workType ? <> · {candidate.workType}</> : null}
            </p>
          </div>

          {/* Matched skills */}
          {matchedSkills.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Matched skills
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-matcher-pale px-2.5 py-0.5 text-xs font-medium text-matcher-dark border border-matcher/40"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-1 text-xs text-gray-400">{t("swipeInstruction")}</p>
        </div>
      </div>
      {/* Swipe overlays */}
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-end pr-6 rounded-2xl">
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-500/90 px-4 py-2 shadow-lg -rotate-12">
          <span className="text-xl font-black uppercase tracking-wider text-white">{t("like")}</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-start pl-6 rounded-2xl">
        <div className="rounded-xl border-2 border-rose-500 bg-rose-500/90 px-4 py-2 shadow-lg rotate-12">
          <span className="text-xl font-black uppercase tracking-wider text-white">{t("nope")}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EmployerCabinetPage() {
  const t = useTranslations("employerCabinetPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [newMatch, setNewMatch] = useState<MutualMatch | null>(null);

  const [vacanciesLoading, setVacanciesLoading] = useState(true);
  const [vacancies, setVacancies] = useState<EmployerVacancy[]>([]);
  const [apiCandidates, setApiCandidates] = useState<
    Array<{
      id: string;
      fullName: string;
      jobTitle: string | null;
      locationCityId: string;
      salaryMin: number;
      workTypes: string[];
      experienceMonths: number;
      educationLevel: string;
      willingToRelocate: boolean;
      availableToWork?: boolean;
      photo?: string | null;
      skills: Array<{ name: string; level: string }>;
    }>
  >([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasSubscription(!!window.sessionStorage.getItem("employerHasSubscription"));
    }
  }, []);
  function loadVacanciesAndCandidates() {
    const companyId = typeof window !== "undefined" ? window.sessionStorage.getItem("matcher_employer_company_id") : null;
    if (!companyId) {
      setVacanciesLoading(false);
      return;
    }
    setVacanciesLoading(true);
    setCandidatesLoading(true);
    fetch(`/api/vacancies?companyId=${encodeURIComponent(companyId)}`)
      .then((r) => r.json())
      .then((list: Array<{ id: string; title: string; company: string; locationCityId: string; salaryMin?: number | null; salaryMax: number; workType: string; isRemote?: boolean; requiredExperienceMonths?: number; requiredEducationLevel?: string; skills?: Array<{ name: string; level?: string; weight?: number }> }>) => {
        const mapped: EmployerVacancy[] = list.map((v) => {
          const locationCityId = v.locationCityId ?? "";
          const loc = locationCityId === "tbilisi" ? "Tbilisi" : locationCityId;
          const salaryStr = v.salaryMin != null ? `${v.salaryMin}–${v.salaryMax} GEL` : `${v.salaryMax} GEL`;
          return {
            id: v.id,
            title: v.title,
            company: v.company ?? v.title,
            location: loc,
            workType: v.workType,
            salary: salaryStr,
            profile: apiVacancyToProfile(v),
          };
        });
        setVacancies(mapped);
      })
      .catch(() => setVacancies([]))
      .finally(() => setVacanciesLoading(false));
  }

  useEffect(() => {
    loadVacanciesAndCandidates();
    const handler = () => loadVacanciesAndCandidates();
    window.addEventListener("employer-company-ready", handler);
    return () => window.removeEventListener("employer-company-ready", handler);
  }, []);

  const [selectedVacancy, setSelectedVacancy] = useState<EmployerVacancy | null>(null);
  const [vacancySwitcherOpen, setVacancySwitcherOpen] = useState(false);
  const vacancySwitcherRef = useRef<HTMLDivElement>(null);

  // Resolve selected vacancy: URL param > sessionStorage > first. Sync URL and storage.
  useEffect(() => {
    if (vacancies.length === 0) return;
    const urlId = searchParams.get("vacancyId")?.trim() ?? null;
    const savedId =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(STORAGE_KEY_SELECTED_VACANCY_ID)
        : null;
    const validFromUrl = urlId && vacancies.some((v) => v.id === urlId);
    const validFromSaved = savedId && vacancies.some((v) => v.id === savedId);
    const resolvedId =
      validFromUrl ? urlId! : validFromSaved ? savedId! : vacancies[0]!.id;
    const next = vacancies.find((v) => v.id === resolvedId) ?? vacancies[0]!;
    setSelectedVacancy(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY_SELECTED_VACANCY_ID, resolvedId);
    }
    const wantUrl = `${pathname}?vacancyId=${resolvedId}`;
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (currentUrl !== wantUrl) {
      router.replace(wantUrl);
    }
  }, [vacancies, pathname, router, searchParams]);

  // Close vacancy dropdown when clicking outside
  useEffect(() => {
    if (!vacancySwitcherOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (vacancySwitcherRef.current && !vacancySwitcherRef.current.contains(e.target as Node)) {
        setVacancySwitcherOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [vacancySwitcherOpen]);
  const candidates = useMemo(
    () =>
      selectedVacancy && apiCandidates.length > 0
        ? buildCandidateCardsWithMatch(apiCandidates, selectedVacancy.profile, selectedVacancy.title)
        : [],
    [selectedVacancy, apiCandidates]
  );
  const [candidateStack, setCandidateStack] = useState<Candidate[]>([]);
  const [liked, setLiked] = useState<Candidate[]>([]);
  const [passed, setPassed] = useState<Candidate[]>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  type LikeState = "idle" | "submitting" | "matched" | "notMatched" | "error";
  const [likeState, setLikeState] = useState<LikeState>("idle");
  const [likeError, setLikeError] = useState<string | null>(null);

  // Reload candidates whenever the selected vacancy changes.
  useEffect(() => {
    if (!selectedVacancy) return;
    const vacancyId = selectedVacancy.id;
    setCandidatesLoading(true);
    async function loadCandidates() {
      try {
        // Prefer the employer-scoped endpoint; fall back to the global candidates
        // list if it fails so the deck is never empty.
        const primaryRes = await fetch(`/api/employer/candidates?vacancyId=${encodeURIComponent(vacancyId)}`);
        if (primaryRes.ok) {
          const primaryList = (await primaryRes.json().catch(() => [])) as unknown;
          if (Array.isArray(primaryList) && primaryList.length > 0) {
            setApiCandidates(primaryList as typeof apiCandidates);
            return;
          }
        }

        const fallbackRes = await fetch("/api/candidates");
        const fallbackList = (await fallbackRes.json().catch(() => [])) as unknown;
        if (Array.isArray(fallbackList)) {
          setApiCandidates(fallbackList as typeof apiCandidates);
        } else {
          setApiCandidates([]);
        }
      } catch {
        setApiCandidates([]);
      } finally {
        setCandidatesLoading(false);
      }
    }

    void loadCandidates();
  }, [selectedVacancy?.id]);

  useEffect(() => {
    if (selectedVacancy && candidates.length > 0) {
      setCandidateStack(candidates);
      setLiked([]);
      setPassed([]);
    }
  }, [selectedVacancy, candidates]);

  const current = candidateStack[0];

  async function withMinimumDelay<T>(promise: Promise<T>, minimumMs = 2000): Promise<T> {
    const [result] = await Promise.all([
      promise,
      new Promise((resolve) => setTimeout(resolve, minimumMs)),
    ]);
    return result;
  }

  function handleSwitchVacancy(v: EmployerVacancy) {
    setSelectedVacancy(v);
    setCandidateStack([]);
    setLiked([]);
    setPassed([]);
    setVacancySwitcherOpen(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY_SELECTED_VACANCY_ID, v.id);
    }
    router.replace(`${pathname}?vacancyId=${v.id}`);
  }

  async function handleDeleteVacancy(e: React.MouseEvent, v: EmployerVacancy) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(t("deleteVacancyConfirm"))) return;
    const companyId = typeof window !== "undefined" ? window.sessionStorage.getItem("matcher_employer_company_id") : null;
    try {
      const res = await fetch(`/api/vacancies/${v.id}?companyId=${encodeURIComponent(companyId ?? "")}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error ?? t("deleteVacancyError"));
        return;
      }
      setVacancies((prev) => prev.filter((x) => x.id !== v.id));
      if (selectedVacancy?.id === v.id) {
        const remaining = vacancies.filter((x) => x.id !== v.id);
        const next = remaining[0] ?? null;
        setSelectedVacancy(next);
        setCandidateStack([]);
        setLiked([]);
        setPassed([]);
        if (next && typeof window !== "undefined") {
          window.sessionStorage.setItem(STORAGE_KEY_SELECTED_VACANCY_ID, next.id);
          router.replace(`${pathname}?vacancyId=${next.id}`);
        }
      }
    } catch {
      alert(t("deleteVacancyError"));
    }
  }

  async function handleSwipe(dir: "left" | "right") {
    if (!current || !selectedVacancy) return;
    if (dir === "left") {
      setExitDir("left");
      setCandidateStack((prev) => prev.slice(1));
      setPassed((prev) => [...prev, current]);
      setTimeout(() => setExitDir(null), 50);
      return;
    }

    try {
      setLikeError(null);
      setLikeState("submitting");

      const res = await withMinimumDelay(
        fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: selectedVacancy.id,
            candidateProfileId: current.id,
            employerLiked: true,
          }),
        }),
        2000
      );
      const data = await res.json().catch(() => ({}));
      setExitDir("right");
      setCandidateStack((prev) => prev.slice(1));
      setLiked((prev) => [...prev, current]);
      setTimeout(() => setExitDir(null), 50);

      if (data.isMatch) {
        setNewMatch({
          id: data.matchId ?? data.id,
          vacancyId: selectedVacancy.id,
          candidateId: current.id,
          candidateName: current.name,
          vacancyTitle: selectedVacancy.title,
          company: selectedVacancy.company,
          createdAt: data.matchedAt
            ? new Date(data.matchedAt).getTime()
            : data.createdAt
            ? new Date(data.createdAt).getTime()
            : Date.now(),
        });
        setLikeState("matched");
      } else {
        setLikeState("idle");
      }
    } catch {
      setLikeState("error");
      setLikeError("Something went wrong");
      setTimeout(() => {
        setLikeState("idle");
        setLikeError(null);
      }, 2000);
    }
  }

  function handleOpenChat() {
    setNewMatch(null);
    setLikeState("idle");
    router.push("/employer/cabinet/chats");
  }

  // Initial load or no vacancies
  if (vacanciesLoading || vacancies.length === 0) {
    if (vacanciesLoading) {
      return (
        <div className="mx-auto max-w-md px-4 py-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-4 h-4 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-8 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-4xl">📋</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{t("noVacanciesYet")}</h2>
          <p className="mt-2 text-gray-600">
            {t("noVacanciesHint")}
          </p>
          <Link
            href="/employer/post?from=cabinet"
            className="mt-6 inline-block rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
          >
            {t("postFirstVacancy")}
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            {t("packageHint")}
          </p>
        </div>
      </div>
    );
  }

  // Still resolving selected vacancy after load
  if (vacancies.length >= 1 && !selectedVacancy) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-4 h-4 w-64 animate-pulse rounded bg-gray-100" />
        <div className="mt-8 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  // Candidate swipe deck with vacancy switcher
  const currentCandidate = candidateStack[0];

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/80 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">{t("candidates")}</h1>
        <div className="relative mt-2" ref={vacancySwitcherRef}>
          <button
            type="button"
            onClick={() => setVacancySwitcherOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            aria-expanded={vacancySwitcherOpen}
            aria-haspopup="listbox"
          >
            <span>
              {selectedVacancy
                ? `${selectedVacancy.title} ${t("at")} ${selectedVacancy.company}`
                : "Select vacancy"}
            </span>
            <svg
              className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${vacancySwitcherOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {vacancySwitcherOpen && (
            <ul
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {vacancies.map((v) => (
                <li key={v.id} role="option">
                  <button
                    type="button"
                    onClick={() => handleSwitchVacancy(v)}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedVacancy?.id === v.id
                        ? "bg-matcher-mint font-medium text-matcher-dark"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block font-medium">{v.title}</span>
                    <span className="block text-xs text-gray-500">
                      {v.location} · {v.workType}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {selectedVacancy
            ? `${selectedVacancy.location} · ${t("recommendedSalary", { amount: getRecommendedSalaryForTitle(selectedVacancy.title).toLocaleString() })}`
            : null}
        </p>
      </div>

      <div className="relative mx-auto mt-8 aspect-[3/4] max-h-[380px] sm:mt-8 sm:max-h-[440px] md:max-h-[520px]">
        {likeError && (
          <div className="absolute -top-12 left-0 right-0 z-10 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 text-center shadow-md">
            {likeError}
          </div>
        )}
        {candidatesLoading && !currentCandidate ? (
          <CandidateCardSkeleton />
        ) : currentCandidate ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCandidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                x: exitDir === "left" ? -400 : 400,
                rotate: exitDir === "left" ? -18 : 18,
                transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="relative h-full w-full">
                <SwipeCard
                  candidate={currentCandidate}
                  vacancyTitle={selectedVacancy?.title ?? ""}
                  companyName={selectedVacancy?.company ?? ""}
                  onSwipe={likeState === "submitting" ? () => {} : handleSwipe}
                />
                {likeState === "submitting" && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-matcher border-t-transparent"></div>
                    <p className="mt-4 font-medium text-gray-700">{t("checkingMatch")}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : candidates.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-4xl">👥</p>
            <p className="mt-4 text-lg font-medium text-gray-700">{t("noCandidatesRightNow") ?? "No candidates right now"}</p>
            <p className="mt-2 text-sm text-gray-500">
              {t("noCandidatesHint") ?? "There are no candidates to show for this vacancy yet. Try another vacancy or check back later."}
            </p>
            <button
              type="button"
              onClick={() => setVacancySwitcherOpen(true)}
              className="mt-6 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("changeVacancy")}
            </button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
            <p className="text-lg font-medium text-gray-600">{t("allCaughtUp")}</p>
            <p className="mt-2 text-sm text-gray-500">
              {t("likedPassed", { liked: liked.length, passed: passed.length })}
            </p>
            <p className="mt-4 text-xs text-gray-400">{t("noMoreCandidates")}</p>
            <button
              type="button"
              onClick={() => setVacancySwitcherOpen(true)}
              className="mt-6 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("viewAnotherVacancy")}
            </button>
          </div>
        )}
      </div>

      {currentCandidate && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center gap-4 relative z-10"
        >
          <motion.button
            type="button"
            disabled={likeState === "submitting"}
            onClick={() => handleSwipe("left")}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500 shadow-md hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">✕</span>
          </motion.button>
          <motion.button
            type="button"
            disabled={likeState === "submitting"}
            onClick={() => handleSwipe("right")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-matcher bg-matcher text-white shadow-md shadow-matcher/30 hover:bg-matcher-dark hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">♥</span>
          </motion.button>
        </motion.div>
      )}

      <MatchCongratulationsModal
        match={newMatch}
        onClose={() => {
          setNewMatch(null);
          setLikeState("idle");
        }}
        onOpenChat={handleOpenChat}
        isCandidateView={false}
      />
    </div>
  );
}
