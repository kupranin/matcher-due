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
type Candidate = import("@/lib/matchMockData").CandidateCard & { match: number };

function SwipeCard({
  candidate,
  onSwipe,
}: {
  candidate: Candidate;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const t = useTranslations("cabinet");
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 80;
    if (info.offset.x > threshold) onSwipe("right");
    else if (info.offset.x < -threshold) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

  const matchPct = Number.isFinite(Number(candidate.match)) ? Math.min(100, Math.max(0, Math.round(Number(candidate.match)))) : 0;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <MatchProgressRing percent={matchPct} size={52} className="text-matcher">
            {matchPct}%
          </MatchProgressRing>
        </div>

        <div className="space-y-2">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gray-100">
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={candidate.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl">👤</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
          <p className="text-gray-600">{candidate.job}</p>
          <p className="text-sm text-gray-500">{candidate.location} · {candidate.workType}</p>
          <p className="text-sm text-gray-600">{candidate.skills}</p>
        </div>

        <p className="text-xs text-gray-400">{t("swipeInstruction")}</p>
      </div>
    </motion.div>
  );
}

export default function EmployerCabinetPage() {
  const t = useTranslations("employerCabinetPage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [newMatch, setNewMatch] = useState<MutualMatch | null>(null);

  const [vacancies, setVacancies] = useState<EmployerVacancy[]>([]);
  const [apiCandidates, setApiCandidates] = useState<Array<{ id: string; fullName: string; jobTitle: string | null; locationCityId: string; salaryMin: number; workTypes: string[]; experienceMonths: number; educationLevel: string; willingToRelocate: boolean; skills: Array<{ name: string; level: string }> }>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasSubscription(!!window.sessionStorage.getItem("employerHasSubscription"));
    }
  }, []);

  function loadVacanciesAndCandidates() {
    const companyId = typeof window !== "undefined" ? window.sessionStorage.getItem("matcher_employer_company_id") : null;
    if (!companyId) return;
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
      .catch(() => {});
    fetch("/api/candidates")
      .then((r) => r.json())
      .then(setApiCandidates)
      .catch(() => {});
  }

  useEffect(() => {
    loadVacanciesAndCandidates();
    const handler = () => loadVacanciesAndCandidates();
    window.addEventListener("employer-company-ready", handler);
    return () => window.removeEventListener("employer-company-ready", handler);
  }, []);

  const [selectedVacancy, setSelectedVacancy] = useState<EmployerVacancy | null>(null);
  useEffect(() => {
    if (vacancies.length === 1 && !selectedVacancy) setSelectedVacancy(vacancies[0]);
  }, [vacancies, selectedVacancy]);
  const candidates = useMemo(
    () => (selectedVacancy && apiCandidates.length > 0 ? buildCandidateCardsWithMatch(apiCandidates, selectedVacancy.profile) : []),
    [selectedVacancy, apiCandidates]
  );
  const [candidateStack, setCandidateStack] = useState<Candidate[]>([]);
  const [liked, setLiked] = useState<Candidate[]>([]);
  const [passed, setPassed] = useState<Candidate[]>([]);

  useEffect(() => {
    if (selectedVacancy && candidates.length > 0) {
      setCandidateStack(candidates);
      setLiked([]);
      setPassed([]);
    }
  }, [selectedVacancy, candidates]);

  const current = candidateStack[0];

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
    setCandidateStack((prev) => prev.slice(1));
    if (dir === "right") {
      setLiked((prev) => [...prev, current]);
      try {
        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: selectedVacancy.id,
            candidateProfileId: current.id,
            employerLiked: true,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.candidateLiked) {
          setNewMatch({
            id: data.id,
            vacancyId: selectedVacancy.id,
            candidateId: current.id,
            candidateName: current.name,
            vacancyTitle: selectedVacancy.title,
            company: selectedVacancy.company,
            createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          });
        }
      } catch {
        // ignore
      }
    } else setPassed((prev) => [...prev, current]);
  }

  function handleOpenChat() {
    setNewMatch(null);
    router.push("/employer/cabinet/chats");
  }

  // No vacancies — clean slate, prompt to add vacancy and buy subscription
  if (vacancies.length === 0) {
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("candidates")}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("candidatesFor")} <span className="font-bold text-matcher-dark">{selectedVacancy.title}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("recommendedSalary", { amount: getRecommendedSalaryForTitle(selectedVacancy.title).toLocaleString() })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleChangeVacancy}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          {t("changeVacancy")}
        </button>
      </div>

      <div className="relative mx-auto mt-8 aspect-[3/4] max-h-[500px]">
        {currentCandidate ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCandidate.id}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <SwipeCard candidate={currentCandidate} onSwipe={handleSwipe} />
            </motion.div>
          </AnimatePresence>
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
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => handleSwipe("left")}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500 shadow-sm hover:bg-gray-50"
          >
            <span className="text-xl">✕</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwipe("right")}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-matcher bg-matcher text-white shadow-sm hover:bg-matcher-dark"
          >
            <span className="text-xl">♥</span>
          </button>
        </div>
      )}

      <MatchCongratulationsModal
        match={newMatch}
        onClose={() => setNewMatch(null)}
        onOpenChat={handleOpenChat}
      />
    </div>
  );
}
