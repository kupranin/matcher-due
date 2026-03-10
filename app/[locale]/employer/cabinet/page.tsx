"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from "framer-motion";
import { buildCandidateCardsWithMatch } from "@/lib/vacancyApi";
import { apiVacancyToProfile } from "@/lib/vacancyApi";
import { getRecommendedSalaryForTitle } from "@/lib/jobTemplates";
import type { MutualMatch } from "@/lib/matchStorage";
import MatchCongratulationsModal from "@/components/MatchCongratulationsModal";
import MatchProgressRing from "@/components/MatchProgressRing";

type EmployerVacancy = {
  id: string;
  title: string;
  location: string;
  workType: string;
  salary: string;
  company: string;
  profile: import("@/lib/matchCalculation").VacancyProfile;
};
type Candidate = import("@/lib/matchMockData").CandidateCard & { match: number; age?: number | null };

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

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 280, damping: 28 });
  }

  const matchPct = Number.isFinite(Number(candidate.match)) ? Math.min(100, Math.max(0, Math.round(Number(candidate.match)))) : 0;
  const skillList = candidate.skills ? candidate.skills.split(", ").slice(0, 4) : [];

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="absolute -inset-3 flex overflow-hidden rounded-[1.4rem]">
        <motion.div style={{ opacity: bgLeftOpacity }} className="flex-1 bg-rose-400/30" aria-hidden />
        <motion.div style={{ opacity: bgRightOpacity }} className="flex-1 bg-emerald-400/30" aria-hidden />
      </div>
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Hero photo */}
        <div className="relative w-full aspect-[4/5] bg-gray-100">
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
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl text-gray-400">
              <span>👤</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-6">
          {/* Top: match badge + name */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {candidate.name}
                {typeof candidate.age === "number" && candidate.age > 0 && (
                  <span className="ml-2 text-base font-semibold text-gray-700">
                    {candidate.age}
                    <span className="ml-1 text-xs font-normal text-gray-500">{tPage("yearsOldShort") || "yrs"}</span>
                  </span>
                )}
              </h2>
              <p className="text-matcher-dark font-medium">{candidate.job}</p>
              <p className="text-sm text-gray-500">
                {candidate.location} · {candidate.workType}
                {typeof candidate.age === "number" && candidate.age > 0 && (
                  <> · {candidate.age} {tPage("yearsOld") || "years old"}</>
                )}
              </p>
            </div>
            <MatchProgressRing percent={matchPct} size={52} className="text-matcher">
              {matchPct}%
            </MatchProgressRing>
          </div>

          {/* Skills */}
          {skillList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skillList.map((s) => (
                <span key={s} className="rounded-full bg-matcher-pale px-2.5 py-0.5 text-xs font-medium text-matcher-dark">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Context: vacancy & company */}
          <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vacancy</p>
            <p className="font-medium text-gray-900">{vacancyTitle}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Company</p>
            <p className="text-sm text-gray-700">{companyName}</p>
          </div>

          <p className="mt-3 text-xs text-gray-400">{t("swipeInstruction")}</p>
        </div>
      </div>
      {/* Swipe overlays */}
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-end pr-6 rounded-2xl">
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-500/90 px-4 py-2 shadow-lg -rotate-12">
          <span className="text-xl font-black uppercase tracking-wider text-white">{t("like")}</span>
        </div>
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-start pl-6 rounded-2xl">
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
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((list: unknown) => {
        if (Array.isArray(list)) setApiCandidates(list);
        else setApiCandidates([]);
      })
      .catch(() => {
        setApiCandidates([]);
      })
      .finally(() => setCandidatesLoading(false));
  }

  useEffect(() => {
    loadVacanciesAndCandidates();
    const handler = () => loadVacanciesAndCandidates();
    window.addEventListener("employer-company-ready", handler);
    return () => window.removeEventListener("employer-company-ready", handler);
  }, []);

  const [selectedVacancy, setSelectedVacancy] = useState<EmployerVacancy | null>(null);
  useEffect(() => {
    if (vacancies.length >= 1 && !selectedVacancy) setSelectedVacancy(vacancies[0]);
  }, [vacancies, selectedVacancy]);
  const candidates = useMemo(
    () => (selectedVacancy && apiCandidates.length > 0 ? buildCandidateCardsWithMatch(apiCandidates, selectedVacancy.profile) : []),
    [selectedVacancy, apiCandidates]
  );
  const [candidateStack, setCandidateStack] = useState<Candidate[]>([]);
  const [liked, setLiked] = useState<Candidate[]>([]);
  const [passed, setPassed] = useState<Candidate[]>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  type LikeState = "idle" | "submitting" | "matched" | "notMatched" | "error";
  const [likeState, setLikeState] = useState<LikeState>("idle");
  const [likeError, setLikeError] = useState<string | null>(null);

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

  function handleSelectVacancy(v: EmployerVacancy) {
    setSelectedVacancy(v);
  }

  function handleChangeVacancy() {
    setSelectedVacancy(null);
    setCandidateStack([]);
    setLiked([]);
    setPassed([]);
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
        setSelectedVacancy(null);
        setCandidateStack([]);
        setLiked([]);
        setPassed([]);
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

  // Multiple vacancies — vacancy selection
  if (!selectedVacancy) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("chooseVacancy")}</h1>
        <p className="mt-1 text-gray-600">
          {t("chooseVacancyHint")}
        </p>

        <div className="mt-8 space-y-3">
          {vacancies.map((v) => (
            <div
              key={v.id}
              className="relative flex w-full flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-matcher hover:bg-matcher-mint/50"
            >
              <button
                type="button"
                onClick={() => handleSelectVacancy(v)}
                className="flex w-full flex-col items-start text-left"
              >
                <span className="font-bold text-gray-900">{v.title}</span>
                <span className="mt-1 text-sm text-gray-600">
                  {v.location} · {v.workType}
                </span>
                <span className="mt-1 text-sm font-medium text-matcher-dark">{v.salary}</span>
                <span className="mt-1 text-xs text-gray-500">
                  {t("recommendedSalary", { amount: getRecommendedSalaryForTitle(v.title).toLocaleString() })}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteVacancy(e, v)}
                className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label={t("deleteVacancy")}
                title={t("deleteVacancy")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/employer/post?from=cabinet" className="font-medium text-matcher-dark hover:text-matcher">
            {t("addAnotherVacancy")}
          </Link>
        </p>
      </div>
    );
  }

  // Single vacancy or after selection — candidate swipe deck
  const currentCandidate = candidateStack[0];

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/80 px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{t("candidates")}</h1>
          <p className="mt-0.5 text-sm font-semibold text-gray-800">
            {selectedVacancy.title} {t("at")} {selectedVacancy.company}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {selectedVacancy.location} · {t("recommendedSalary", { amount: getRecommendedSalaryForTitle(selectedVacancy.title).toLocaleString() })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleChangeVacancy}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
        >
          {t("changeVacancy")}
        </button>
      </div>

      <div className="relative mx-auto mt-8 aspect-[3/4] max-h-[500px]">
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
                  vacancyTitle={selectedVacancy.title}
                  companyName={selectedVacancy.company}
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
              onClick={handleChangeVacancy}
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
              onClick={handleChangeVacancy}
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
