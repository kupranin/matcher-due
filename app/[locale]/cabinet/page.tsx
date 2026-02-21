"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from "framer-motion";
import { buildVacancyCardsWithMatch } from "@/lib/vacancyApi";
import { GEORGIAN_CITIES } from "@/lib/georgianLocations";
import { getCandidateProfileForMatch, loadCandidateProfile, getCandidateProfileId, getCandidateUserId, saveCandidateProfile } from "@/lib/candidateProfileStorage";
import { addCandidateLike, setCandidatePitch, type MutualMatch } from "@/lib/matchStorage";
import MatchCongratulationsModal from "@/components/MatchCongratulationsModal";
import MatchProgressRing from "@/components/MatchProgressRing";
import PitchModal from "@/components/PitchModal";

type Vacancy = import("@/lib/vacancyApi").VacancyCardFromApi;

const VibeIcons = {
  noCv: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  flexible: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  weeklyPay: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm0 0V7a2 2 0 012-2h2a2 2 0 012 2v0" />
    </svg>
  ),
};

function SwipeCard({
  vacancy,
  onSwipe,
}: {
  vacancy: Vacancy;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const t = useTranslations("cabinet");
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const nopeOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);

  const flexibleHours = vacancy.workType.toLowerCase().includes("part") || vacancy.workType.toLowerCase().includes("remote") || vacancy.workType.toLowerCase().includes("flex");
  const vibes = [
    { key: "noCv", show: true, icon: VibeIcons.noCv, label: "No CV needed" },
    { key: "flexible", show: flexibleHours, icon: VibeIcons.flexible, label: "Flexible hours" },
    { key: "weeklyPay", show: true, icon: VibeIcons.weeklyPay, label: "Weekly pay" },
  ].filter((v) => v.show);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 80;
    if (info.offset.x > threshold) onSwipe("right");
    else if (info.offset.x < -threshold) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -180, right: 180 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-gray-900 shadow-2xl shadow-gray-300/50 ring-2 ring-white/20">
        {/* Image block – salary pill top-right, match ring top-left */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
          <img
            src={vacancy.photo}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* High-contrast salary pill – top right, Gen Z scannable */}
          <div className="absolute right-3 top-3 rounded-full bg-matcher-bright px-3 py-1.5 text-sm font-bold tracking-tight text-charcoal shadow-lg sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-base">
            {vacancy.salary}
          </div>
          {/* Circular match ring around employer initial – top left */}
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
            <MatchProgressRing percent={vacancy.match} size={48} className="text-matcher-bright">
              {vacancy.match}%
            </MatchProgressRing>
          </div>
          {/* Swipe overlays */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-end pr-8"
          >
            <div className="rounded-2xl border-4 border-matcher bg-matcher/90 px-6 py-3 shadow-xl -rotate-12">
              <span className="text-3xl font-black uppercase tracking-wider text-white">{t("like")}</span>
            </div>
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-start pl-8"
          >
            <div className="rounded-2xl border-4 border-rose-400 bg-rose-500/90 px-6 py-3 shadow-xl rotate-12">
              <span className="text-3xl font-black uppercase tracking-wider text-white">{t("nope")}</span>
            </div>
          </motion.div>
        </div>

        {/* Dark info block – title, company, vibe row, location */}
        <div className="flex flex-1 flex-col justify-between p-5 text-white">
          <div>
            <h2 className="font-heading text-2xl font-bold">{vacancy.title}</h2>
            <p className="mt-0.5 text-lg font-medium text-white/90">{vacancy.company}</p>
            {/* Vibe row: icons for No CV, Flexible Hours, Weekly Pay */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {vibes.map((v) => (
                <span
                  key={v.key}
                  className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white/95"
                  title={v.label}
                >
                  {v.icon}
                  <span className="sr-only">{v.label}</span>
                </span>
              ))}
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium">
                {vacancy.location}
              </span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium">
                {vacancy.workType}
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-white/80">{t("swipeInstruction")}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CabinetPage() {
  const t = useTranslations("cabinet");
  const router = useRouter();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  const [availableToWork, setAvailableToWork] = useState(true);
  const [availableToWorkLoading, setAvailableToWorkLoading] = useState(false);

  useEffect(() => {
    const profileUserId = getCandidateUserId();
    const loadProfile = () => getCandidateProfileForMatch();
    if (profileUserId) {
      fetch(`/api/candidates/profile?userId=${encodeURIComponent(profileUserId)}`)
        .then((r) => r.json())
        .then((data: { fullName?: string; email?: string; phone?: string; locationCityId?: string; salaryMin?: number; workTypes?: string[]; willingToRelocate?: boolean; skills?: Array<{ name: string; level: string }>; educationLevel?: string; experienceMonths?: number; jobTitle?: string; availableToWork?: boolean } | null) => {
          if (data && data.fullName) {
            setAvailableToWork(data.availableToWork !== false);
            saveCandidateProfile({
              profile: {
                locationCityId: data.locationCityId ?? "tbilisi",
                salaryMin: data.salaryMin ?? 800,
                willingToRelocate: data.willingToRelocate ?? false,
                experienceMonths: data.experienceMonths ?? 0,
                educationLevel: (data.educationLevel as "High School") ?? "High School",
                workTypes: data.workTypes ?? ["Full-time"],
                skills: (data.skills ?? []).map((s) => ({ name: s.name, level: (s.level as "Intermediate") ?? "Intermediate" })),
              },
              fullName: data.fullName,
              email: data.email ?? "",
              phone: data.phone ?? "",
              job: data.jobTitle ?? undefined,
            });
          }
        })
        .catch(() => {});
    }
    const stored = loadCandidateProfile();
    const profile = stored?.profile ?? loadProfile();
    const preferredJob = stored?.job ?? undefined;
    fetch("/api/vacancies")
      .then((r) => r.json())
      .then((list: unknown) => {
        if (Array.isArray(list) && list.length > 0) {
          setVacancies(buildVacancyCardsWithMatch(list as Parameters<typeof buildVacancyCardsWithMatch>[0], profile, preferredJob));
        }
      })
      .catch(() => {});
  }, []);
  const [liked, setLiked] = useState<Vacancy[]>([]);
  const [passed, setPassed] = useState<Vacancy[]>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [newMatch, setNewMatch] = useState<MutualMatch | null>(null);
  const [pendingLikeVacancy, setPendingLikeVacancy] = useState<Vacancy | null>(null);
  const current = vacancies[0];

  async function finishLike(vacancy: Vacancy, pitch: string) {
    setLiked((prev) => [...prev, vacancy]);
    addCandidateLike(vacancy.id);
    if (pitch) setCandidatePitch(vacancy.id, pitch);
    const profileId = getCandidateProfileId();
    const stored = loadCandidateProfile();
    const candidateName = stored?.fullName ?? "Candidate";
    if (profileId) {
      try {
        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: vacancy.id,
            candidateProfileId: profileId,
            candidateLiked: true,
            candidatePitch: pitch || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.employerLiked) {
          setNewMatch({
            id: data.id,
            vacancyId: vacancy.id,
            candidateId: profileId,
            candidateName,
            vacancyTitle: vacancy.title,
            company: vacancy.company,
            createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          });
        }
      } catch {
        // ignore
      }
    }
    setPendingLikeVacancy(null);
  }

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    setExitDir(dir);
    setVacancies((prev) => prev.slice(1));
    if (dir === "right") {
      setPendingLikeVacancy(current);
    } else {
      setPassed((prev) => [...prev, current]);
    }
    setTimeout(() => setExitDir(null), 50);
  }

  function handleOpenChat() {
    setNewMatch(null);
    router.push("/cabinet/chats");
  }

  async function toggleAvailableToWork() {
    const userId = getCandidateUserId();
    if (!userId) return;
    setAvailableToWorkLoading(true);
    const next = !availableToWork;
    try {
      const res = await fetch("/api/candidates/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, availableToWork: next }),
      });
      if (res.ok) setAvailableToWork(next);
    } catch {
      // keep previous state
    } finally {
      setAvailableToWorkLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-md px-4 py-5 sm:py-6 md:py-8">
      {/* Fun gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-matcher-pale via-matcher-mint/50 to-matcher-amber/30" />

      {/* Available to work toggle */}
      {getCandidateUserId() && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-matcher/20 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <span className="text-sm font-medium text-gray-700">{t("availableToWorkLabel")}</span>
          <button
            type="button"
            onClick={toggleAvailableToWork}
            disabled={availableToWorkLoading}
            className={`relative inline-flex h-8 w-14 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-matcher focus:ring-offset-2 ${availableToWork ? "bg-matcher" : "bg-gray-300"}`}
            aria-pressed={availableToWork}
            aria-label={availableToWork ? t("availableToWorkOn") : t("availableToWorkOff")}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${availableToWork ? "translate-x-7" : "translate-x-1"} mt-1`}
            />
          </button>
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{t("yourMatches")}</h1>
      <p className="mt-2 text-gray-600">{t("swipeHint")}</p>

      <div className="relative mx-auto mt-6 aspect-[3/4] max-h-[380px] sm:mt-8 sm:max-h-[440px] md:max-h-[520px]">
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                x: exitDir === "right" ? 400 : exitDir === "left" ? -400 : 0,
                rotate: exitDir === "right" ? 20 : exitDir === "left" ? -20 : 0,
                transition: { duration: 0.3, ease: "easeIn" },
              }}
              className="absolute inset-0"
            >
              <SwipeCard vacancy={current} onSwipe={handleSwipe} />
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-matcher-mint via-matcher-pale to-matcher-teal/20 p-8 text-center shadow-inner"
          >
            <span className="text-6xl">🎉</span>
            <p className="mt-4 text-xl font-bold text-gray-800">{t("allCaughtUp")}</p>
            <p className="mt-2 text-base text-gray-600">
              {t("likedPassed", { liked: liked.length, passed: passed.length })}
            </p>
            <p className="mt-6 text-sm text-gray-500">{t("checkBackLater")}</p>
          </motion.div>
        )}
      </div>

      {/* Colorful action buttons */}
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center gap-6 sm:mt-8 sm:gap-8"
        >
          <motion.button
            type="button"
            onClick={() => handleSwipe("left")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg shadow-rose-300/50 transition-shadow hover:shadow-xl hover:shadow-rose-400/50"
          >
            <span className="text-2xl font-bold">✕</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleSwipe("right")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 bg-gradient-to-br from-matcher to-matcher-teal text-white shadow-lg shadow-matcher/40 transition-shadow hover:shadow-xl hover:shadow-matcher/50"
          >
            <span className="text-2xl">♥</span>
          </motion.button>
        </motion.div>
      )}

      {pendingLikeVacancy && (
        <PitchModal
          company={pendingLikeVacancy.company}
          vacancyTitle={pendingLikeVacancy.title}
          onSubmit={(pitch) => finishLike(pendingLikeVacancy, pitch)}
          onSkip={() => finishLike(pendingLikeVacancy, "")}
        />
      )}

      <MatchCongratulationsModal
        match={newMatch}
        onClose={() => setNewMatch(null)}
        onOpenChat={handleOpenChat}
      />
    </div>
  );
}
