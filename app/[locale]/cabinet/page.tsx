"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from "framer-motion";
import { buildVacancyCardsWithMatch } from "@/lib/vacancyApi";
import { GEORGIAN_CITIES } from "@/lib/georgianLocations";
import { getCandidateProfileForMatch, loadCandidateProfile, getCandidateProfileId, getCandidateUserId, saveCandidateProfile } from "@/lib/candidateProfileStorage";
import { addCandidateLike, type MutualMatch } from "@/lib/matchStorage";
import MatchCongratulationsModal from "@/components/MatchCongratulationsModal";
import MatchProgressRing from "@/components/MatchProgressRing";

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

const SWIPE_THRESHOLD = 100;

function SwipeCard({
  vacancy,
  onSwipe,
}: {
  vacancy: Vacancy;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const t = useTranslations("cabinet");
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-14, 14]);
  const likeOpacity = useTransform(x, [0, 60, SWIPE_THRESHOLD], [0, 0.4, 1]);
  const nopeOpacity = useTransform(x, [-220, -100, 0], [1, 0.4, 0]);
  const bgLeftOpacity = useTransform(x, [0, -120], [0, 0.22]);
  const bgRightOpacity = useTransform(x, [120, 0], [0.22, 0]);

  const flexibleHours = vacancy.workType.toLowerCase().includes("part") || vacancy.workType.toLowerCase().includes("remote") || vacancy.workType.toLowerCase().includes("flex");
  const vibes = [
    { key: "noCv", show: true, icon: VibeIcons.noCv, label: "No CV needed" },
    { key: "flexible", show: flexibleHours, icon: VibeIcons.flexible, label: "Flexible hours" },
    { key: "weeklyPay", show: true, icon: VibeIcons.weeklyPay, label: "Weekly pay" },
  ].filter((v) => v.show);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 280, damping: 28 });
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      role="article"
      aria-label={`${vacancy.title} at ${vacancy.company}`}
    >
      {/* Background hint: green right, red left */}
      <div className="absolute -inset-3 flex rounded-[1.5rem] overflow-hidden">
        <motion.div style={{ opacity: bgLeftOpacity }} className="flex-1 bg-rose-400/40" aria-hidden />
        <motion.div style={{ opacity: bgRightOpacity }} className="flex-1 bg-emerald-400/40" aria-hidden />
      </div>
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-gray-900 shadow-2xl shadow-gray-300/50 ring-2 ring-white/20">
        {/* Image block – salary pill top-right, match ring top-left */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
          <Image
            src={vacancy.photo}
            alt={vacancy.title ? `${vacancy.title} at ${vacancy.company}` : "Vacancy photo"}
            fill
            priority={false}
            sizes="(min-width: 768px) 400px, 100vw"
            className="object-cover"
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
          {vacancy.topMatch && (
            <div className="absolute left-3 bottom-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-md sm:left-4 sm:bottom-4">
              Top match
            </div>
          )}
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

        {/* Dark info block – title, company, description, skills, vibe row, location */}
        <div className="flex flex-1 flex-col justify-between p-5 text-white">
          <div>
            <h2 className="font-heading text-2xl font-bold">{vacancy.title}</h2>
            <p className="mt-0.5 text-lg font-medium text-white/90">{vacancy.company}</p>
            {/* Quick view */}
            {vacancy.description && (
              <p className="mt-2 text-sm text-gray-300 line-clamp-2">{vacancy.description}</p>
            )}
            {Array.isArray(vacancy.profile?.skills) && vacancy.profile.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {vacancy.profile.skills.slice(0, 3).map((s) => (
                  <span
                    key={s.name}
                    className="px-2 py-1 text-xs bg-white/15 rounded-md text-white/95"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/15"
              aria-expanded={expanded}
            >
              {expanded ? "Hide details" : "Tap to expand"}
              <span aria-hidden className="text-white/70">
                {expanded ? "▴" : "▾"}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-3 rounded-2xl bg-white/10 p-4">
                    {vacancy.description && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                          Job description
                        </p>
                        <p className="mt-1 text-sm text-white/90">{vacancy.description}</p>
                      </div>
                    )}
                    {Array.isArray(vacancy.profile?.skills) && vacancy.profile.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                          Tech stack
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {vacancy.profile.skills.slice(0, 10).map((s) => (
                            <span
                              key={s.name}
                              className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

function OpportunitiesSkeleton() {
  return (
    <div className="flex h-full min-h-[380px] w-full flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xl">
      <div className="aspect-[4/3] w-full shrink-0 bg-gray-100 animate-pulse" />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <div className="h-6 w-3/4 rounded-lg bg-gray-200/80 animate-pulse" />
          <div className="h-4 w-1/2 rounded-lg bg-gray-200/80 animate-pulse" />
          <div className="flex gap-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-14 rounded-full bg-gray-200/80 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="mt-4 h-3 w-2/3 rounded bg-gray-200/80 animate-pulse" />
      </div>
    </div>
  );
}

export default function CabinetPage() {
  const t = useTranslations("cabinet");
  const router = useRouter();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);

  const [availableToWork, setAvailableToWork] = useState(true);
  const [availableToWorkLoading, setAvailableToWorkLoading] = useState(false);

  useEffect(() => {
    async function load() {
      let profileUserId = getCandidateUserId();
      let profileId = getCandidateProfileId();
      const loadProfile = () => getCandidateProfileForMatch();

      // Fallback: derive candidate user id from the authenticated session if
      // localStorage was never populated (e.g. user registered before this logic existed).
      if (!profileUserId) {
        try {
          const res = await fetch("/api/auth/session", { credentials: "include" });
          const data = (await res.json().catch(() => null)) as { userId?: string | null; user?: { role?: string | null } | null } | null;
          if (data?.userId && data.user?.role === "CANDIDATE") {
            profileUserId = data.userId;
            if (typeof window !== "undefined") {
              window.localStorage.setItem("matcher_candidate_user_id", profileUserId);
            }
          }
        } catch {
          // ignore; we'll fall back to local-only profile
        }
      }

      if (profileUserId) {
        try {
          const res = await fetch(`/api/candidates/profile?userId=${encodeURIComponent(profileUserId)}`);
          const data = (await res.json().catch(() => null)) as {
            profileId?: string;
            fullName?: string;
            email?: string;
            phone?: string;
            locationCityId?: string;
            salaryMin?: number;
            workTypes?: string[];
            willingToRelocate?: boolean;
            skills?: Array<{ name: string; level: string }>;
            educationLevel?: string;
            experienceMonths?: number;
            jobTitle?: string;
            availableToWork?: boolean;
          } | null;
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
            if (data.profileId && typeof window !== "undefined") {
              window.localStorage.setItem("matcher_candidate_profile_id", data.profileId);
              profileId = data.profileId;
            }
          }
        } catch {
          // ignore API errors; we'll still show local opportunities
        }
      }

      setOpportunitiesLoading(true);
      const stored = loadCandidateProfile();
      const profile = stored?.profile ?? loadProfile();
      const preferredJob = stored?.job ?? undefined;
      // Re-read profileId from storage in case it was just written.
      if (!profileId && typeof window !== "undefined") {
        profileId = window.localStorage.getItem("matcher_candidate_profile_id");
      }
      const url = profileId
        ? `/api/vacancies?candidateProfileId=${encodeURIComponent(profileId)}`
        : "/api/vacancies";
      fetch(url)
        .then((r) => r.json())
        .then((list: unknown) => {
          if (Array.isArray(list) && list.length > 0) {
            setVacancies(buildVacancyCardsWithMatch(list as Parameters<typeof buildVacancyCardsWithMatch>[0], profile, preferredJob));
          } else {
            setVacancies([]);
          }
        })
        .catch(() => setVacancies([]))
        .finally(() => setOpportunitiesLoading(false));
    }

    void load();
  }, []);
  const [liked, setLiked] = useState<Vacancy[]>([]);
  const [passed, setPassed] = useState<Vacancy[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ vacancy: Vacancy; dir: "left" | "right" }>>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [newMatch, setNewMatch] = useState<MutualMatch | null>(null);
  const current = vacancies[0];
  type LikeState = "idle" | "submitting" | "matched" | "notMatched" | "error";
  const [likeState, setLikeState] = useState<LikeState>("idle");
  const [likeError, setLikeError] = useState<string | null>(null);

  // Ensure we have a real candidateProfileId in localStorage so swipes can be
  // persisted via /api/matches, even for older accounts that predate this key.
  async function ensureCandidateProfileId(): Promise<string | null> {
    let profileId = getCandidateProfileId();
    if (profileId) return profileId;

    let userId = getCandidateUserId();
    // Fallback: resolve candidate user id from the authenticated session.
    if (!userId) {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        const data = (await res.json().catch(() => null)) as { userId?: string | null; user?: { id?: string; role?: string | null } | null } | null;
        if (data?.user?.role === "CANDIDATE") {
          userId = data.user.id || data.userId || null;
          if (userId && typeof window !== "undefined") {
            window.localStorage.setItem("matcher_candidate_user_id", userId);
          }
        }
      } catch {
        // ignore; we'll bail below if we still don't have an id
      }
    }

    if (!userId) return null;

    try {
      const res = await fetch(`/api/candidates/profile?userId=${encodeURIComponent(userId)}`);
      const data = (await res.json().catch(() => null)) as { profileId?: string } | null;
      if (data?.profileId) {
        profileId = data.profileId;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("matcher_candidate_profile_id", profileId);
        }
        return profileId;
      }
    } catch {
      // ignore
    }
    return null;
  }

  async function withMinimumDelay<T>(promise: Promise<T>, minimumMs = 2000): Promise<T> {
    const [result] = await Promise.all([
      promise,
      new Promise((resolve) => setTimeout(resolve, minimumMs)),
    ]);
    return result;
  }

  async function handleSwipe(dir: "left" | "right") {
    if (!current) return;

    if (dir === "left") {
      setExitDir("left");
      setVacancies((prev) => prev.slice(1));
      setPassed((prev) => [...prev, current]);
      setSwipeHistory((prev) => [...prev, { vacancy: current, dir: "left" }]);
      setTimeout(() => setExitDir(null), 50);

      // Optimistic persistence (fire-and-forget).
      void (async () => {
        let profileId = getCandidateProfileId();
        if (!profileId) profileId = await ensureCandidateProfileId();
        if (!profileId) return;
        try {
          await fetch("/api/discards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vacancyId: current.id, candidateProfileId: profileId }),
          });
        } catch {
          // ignore; next refresh will still show it unless server saved the discard
        }
      })();
      return;
    }

    let profileId = getCandidateProfileId();
    if (!profileId) {
      profileId = await ensureCandidateProfileId();
    }
    if (!profileId) {
      // Still no profile id — treat as local-only swipe but surface a gentle error
      // so we notice in QA.
      setLikeError("We could not link your profile. Please complete your profile and try again.");
      setExitDir("right");
      setVacancies((prev) => prev.slice(1));
      setLiked((prev) => [...prev, current]);
      setSwipeHistory((prev) => [...prev, { vacancy: current, dir: "right" }]);
      addCandidateLike(current.id);
      setTimeout(() => setExitDir(null), 50);
      return;
    }

    const stored = loadCandidateProfile();
    const candidateName = stored?.fullName ?? "Candidate";

    setLikeError(null);
    setLikeState("submitting");

    try {
      const res = await withMinimumDelay(
        fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vacancyId: current.id,
            candidateProfileId: profileId,
            candidateLiked: true,
          }),
        }),
        2000
      );
      const data = await res.json().catch(() => ({}));

      setExitDir("right");
      setVacancies((prev) => prev.slice(1));
      setLiked((prev) => [...prev, current]);
      setSwipeHistory((prev) => [...prev, { vacancy: current, dir: "right" }]);
      addCandidateLike(current.id);

      if (data.isMatch) {
        setNewMatch({
          id: data.matchId ?? data.id ?? `${current.id}-${profileId}`,
          vacancyId: current.id,
          candidateId: profileId,
          candidateName,
          vacancyTitle: current.title,
          company: current.company,
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

      setTimeout(() => setExitDir(null), 50);
    } catch {
      setLikeState("error");
      setLikeError("Something went wrong");
      setTimeout(() => {
        setLikeState("idle");
        setLikeError(null);
      }, 2000);
    }
  }

  async function handleRewind() {
    const last = swipeHistory[swipeHistory.length - 1];
    if (!last) return;

    setSwipeHistory((prev) => prev.slice(0, -1));
    setVacancies((prev) => [last.vacancy, ...prev]);
    if (last.dir === "left") {
      setPassed((prev) => prev.filter((v) => v.id !== last.vacancy.id));
    } else {
      setLiked((prev) => prev.filter((v) => v.id !== last.vacancy.id));
    }

    // Best-effort server undo so a refresh doesn't permanently lose the card.
    void (async () => {
      let profileId = getCandidateProfileId();
      if (!profileId) profileId = await ensureCandidateProfileId();
      if (!profileId) return;
      try {
        if (last.dir === "left") {
          await fetch("/api/discards", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vacancyId: last.vacancy.id, candidateProfileId: profileId }),
          });
        } else {
          await fetch("/api/matches", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vacancyId: last.vacancy.id,
              candidateProfileId: profileId,
              candidateLiked: false,
            }),
          });
        }
      } catch {
        // ignore
      }
    })();
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

      {likeError && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm">
          {likeError}
        </div>
      )}

      <div className="relative mx-auto mt-6 aspect-[3/4] max-h-[380px] sm:mt-8 sm:max-h-[440px] md:max-h-[520px]">
        {opportunitiesLoading ? (
          <OpportunitiesSkeleton />
        ) : current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                x: exitDir === "right" ? 420 : exitDir === "left" ? -420 : 0,
                rotate: exitDir === "right" ? 18 : exitDir === "left" ? -18 : 0,
                transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="relative h-full w-full">
                <SwipeCard vacancy={current} onSwipe={likeState === "submitting" ? () => {} : handleSwipe} />
                {likeState === "submitting" && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-gray-900/80 backdrop-blur-sm">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-matcher-bright border-t-transparent" />
                    <p className="mt-3 text-sm font-medium text-white">{t("checkingMatch")}</p>
                  </div>
                )}
              </div>
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
            <p className="mt-6 text-sm text-gray-500">{t("noMoreOpportunities")}</p>
          </motion.div>
        )}
      </div>

      {current && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex justify-center gap-6 sm:mt-8 sm:gap-8"
        >
          <motion.button
            type="button"
            disabled={likeState === "submitting"}
            onClick={() => handleSwipe("left")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg shadow-rose-300/50 transition-shadow hover:shadow-xl hover:shadow-rose-400/50 disabled:opacity-50 disabled:cursor-not-allowed active:ring-4 active:ring-rose-300/50"
          >
            <span className="text-2xl font-bold">✕</span>
          </motion.button>
          <motion.button
            type="button"
            disabled={likeState === "submitting" || swipeHistory.length === 0}
            onClick={handleRewind}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 bg-gradient-to-br from-gray-100 to-white text-gray-800 shadow-lg shadow-gray-300/40 transition-shadow hover:shadow-xl hover:shadow-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed active:ring-4 active:ring-gray-300/60"
            aria-label="Rewind last swipe"
            title="Rewind"
          >
            <span className="text-2xl font-bold">↺</span>
          </motion.button>
          <motion.button
            type="button"
            disabled={likeState === "submitting"}
            onClick={() => handleSwipe("right")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 bg-gradient-to-br from-matcher to-matcher-teal text-white shadow-lg shadow-matcher/40 transition-shadow hover:shadow-xl hover:shadow-matcher/50 disabled:opacity-50 disabled:cursor-not-allowed active:ring-4 active:ring-matcher/40"
          >
            <span className="text-2xl">♥</span>
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
        isCandidateView={true}
      />
    </div>
  );
}
