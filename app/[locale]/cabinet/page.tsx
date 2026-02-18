"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from "framer-motion";
import { getVacanciesWithMatch } from "@/lib/matchMockData";
import { getCandidateProfileForMatch, loadCandidateProfile } from "@/lib/candidateProfileStorage";
import {
  addCandidateLike,
  getEmployerLikes,
  checkAndRecordMutualMatch,
  CANDIDATE_VACANCY_TO_EMPLOYER,
  type MutualMatch,
} from "@/lib/matchStorage";
import MatchCongratulationsModal from "@/components/MatchCongratulationsModal";

type Vacancy = Awaited<ReturnType<typeof getVacanciesWithMatch>>[number];

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
        {/* Image block – full width, match badge only */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
          <img
            src={vacancy.photo}
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Swipe overlays on image */}
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
          <div className="absolute left-4 top-4 rounded-full bg-matcher px-4 py-1.5 text-sm font-bold text-white shadow-lg">
            {t("matchPercent", { percent: vacancy.match })}
          </div>
        </div>

        {/* Dark info block below image */}
        <div className="flex flex-1 flex-col justify-between p-5 text-white">
          <div>
            <h2 className="text-2xl font-bold">{vacancy.title}</h2>
            <p className="mt-0.5 text-lg font-medium text-white/90">{vacancy.company}</p>
            <p className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium">
                {vacancy.location}
              </span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium">
                {vacancy.workType}
              </span>
            </p>
            <p className="mt-3 text-base font-bold text-matcher">{vacancy.salary}</p>
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

  useEffect(() => {
    const profile = getCandidateProfileForMatch();
    setVacancies(getVacanciesWithMatch(profile));
  }, []);
  const [liked, setLiked] = useState<Vacancy[]>([]);
  const [passed, setPassed] = useState<Vacancy[]>([]);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [newMatch, setNewMatch] = useState<MutualMatch | null>(null);
  const current = vacancies[0];

  function handleSwipe(dir: "left" | "right") {
    if (!current) return;
    setExitDir(dir);
    setVacancies((prev) => prev.slice(1));
    if (dir === "right") {
      setLiked((prev) => [...prev, current]);
      addCandidateLike(current.id);
      // Check if employer already liked this candidate for this vacancy
      const empVacancyId = CANDIDATE_VACANCY_TO_EMPLOYER[current.id];
      if (empVacancyId) {
        const employerLikes = getEmployerLikes();
        const alreadyLiked = employerLikes.some(
          (l) => l.vacancyId === empVacancyId && l.candidateId === "1"
        );
        if (alreadyLiked) {
          const stored = loadCandidateProfile();
          const candidateName = stored?.fullName || "Nino K.";
          const match = checkAndRecordMutualMatch(
            current.id,
            empVacancyId,
            "1",
            candidateName,
            current.title,
            current.company
          );
          if (match) setNewMatch(match);
        }
      }
    } else setPassed((prev) => [...prev, current]);
    setTimeout(() => setExitDir(null), 50);
  }

  function handleOpenChat() {
    setNewMatch(null);
    router.push("/cabinet/chats");
  }

  return (
    <div className="relative mx-auto max-w-md px-4 py-5 sm:py-6 md:py-8">
      {/* Fun gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-matcher-pale via-matcher-mint/50 to-matcher-amber/30" />

      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{t("yourMatches")}</h1>
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

      <MatchCongratulationsModal
        match={newMatch}
        onClose={() => setNewMatch(null)}
        onOpenChat={handleOpenChat}
      />
    </div>
  );
}
