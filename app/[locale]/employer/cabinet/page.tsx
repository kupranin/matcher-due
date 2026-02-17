"use client";

import { useState, useMemo, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence, animate } from "framer-motion";
import {
  getCandidatesWithMatch,
  MOCK_EMPLOYER_VACANCIES,
  type EmployerVacancy,
} from "@/lib/matchMockData";
import {
  addEmployerLike,
  getCandidateLikes,
  EMPLOYER_VACANCY_TO_CANDIDATE,
  checkAndRecordMutualMatch,
  EMPLOYER_VACANCY_INFO,
  type MutualMatch,
} from "@/lib/matchStorage";
import MatchCongratulationsModal from "@/components/MatchCongratulationsModal";

type Candidate = Awaited<ReturnType<typeof getCandidatesWithMatch>>[number];

function SwipeCard({
  candidate,
  onSwipe,
}: {
  candidate: Candidate;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 80;
    if (info.offset.x > threshold) onSwipe("right");
    else if (info.offset.x < -threshold) onSwipe("left");
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

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
          <span className="rounded-full bg-matcher-mint px-3 py-1 text-sm font-semibold text-matcher-dark">
            {candidate.match}% match
          </span>
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

        <p className="text-xs text-gray-400">Swipe right to like · left to pass</p>
      </div>
    </motion.div>
  );
}

export default function EmployerCabinetPage() {
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [newMatch, setNewMatch] = useState<MutualMatch | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasSubscription(!!window.sessionStorage.getItem("employerHasSubscription"));
    }
  }, []);

  const vacancies = hasSubscription ? MOCK_EMPLOYER_VACANCIES : [];
  const [selectedVacancy, setSelectedVacancy] = useState<EmployerVacancy | null>(
    vacancies.length === 1 ? vacancies[0] : null
  );
  const candidates = useMemo(
    () => (selectedVacancy ? getCandidatesWithMatch(selectedVacancy.profile) : []),
    [selectedVacancy]
  );
  const [candidateStack, setCandidateStack] = useState<Candidate[]>([]);
  const [liked, setLiked] = useState<Candidate[]>([]);
  const [passed, setPassed] = useState<Candidate[]>([]);

  useEffect(() => {
    if (selectedVacancy) {
      setCandidateStack(getCandidatesWithMatch(selectedVacancy.profile));
      setLiked([]);
      setPassed([]);
    }
  }, [selectedVacancy]);

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

  function handleSwipe(dir: "left" | "right") {
    if (!current || !selectedVacancy) return;
    setCandidateStack((prev) => prev.slice(1));
    if (dir === "right") {
      setLiked((prev) => [...prev, current]);
      addEmployerLike(selectedVacancy.id, current.id);
      // Check if candidate already liked this vacancy
      const candidateVacancyId = EMPLOYER_VACANCY_TO_CANDIDATE[selectedVacancy.id];
      if (candidateVacancyId) {
        const candidateLikes = getCandidateLikes();
        if (candidateLikes.includes(candidateVacancyId)) {
          const info = EMPLOYER_VACANCY_INFO[selectedVacancy.id];
          if (info) {
            const match = checkAndRecordMutualMatch(
              candidateVacancyId,
              selectedVacancy.id,
              current.id,
              current.name,
              info.title,
              info.company
            );
            if (match) setNewMatch(match);
          }
        }
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
          <h2 className="mt-4 text-xl font-bold text-gray-900">No vacancies yet</h2>
          <p className="mt-2 text-gray-600">
            Post your first vacancy and choose a package to see relevant candidates and start matching.
          </p>
          <Link
            href="/employer/post?from=cabinet"
            className="mt-6 inline-block rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
          >
            Post your first vacancy
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            You&apos;ll fill in the vacancy details, then choose a package (1–10 vacancies or unlimited) and complete payment.
          </p>
        </div>
      </div>
    );
  }

  // Multiple vacancies — vacancy selection
  if (!selectedVacancy) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Choose a vacancy</h1>
        <p className="mt-1 text-gray-600">
          Select which vacancy you want to see candidates for.
        </p>

        <div className="mt-8 space-y-3">
          {vacancies.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleSelectVacancy(v)}
              className="flex w-full flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-matcher hover:bg-matcher-mint/50"
            >
              <span className="font-bold text-gray-900">{v.title}</span>
              <span className="mt-1 text-sm text-gray-600">
                {v.location} · {v.workType}
              </span>
              <span className="mt-1 text-sm font-medium text-matcher-dark">{v.salary}</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/employer/post?from=cabinet" className="font-medium text-matcher-dark hover:text-matcher">
            + Add another vacancy
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Candidates</h1>
          <p className="mt-1 text-sm text-gray-600">
            for <span className="font-bold text-matcher-dark">{selectedVacancy.title}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleChangeVacancy}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Change vacancy
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
            <p className="text-lg font-medium text-gray-600">You&apos;re all caught up!</p>
            <p className="mt-2 text-sm text-gray-500">
              {liked.length} liked · {passed.length} passed
            </p>
            <p className="mt-4 text-xs text-gray-400">No more candidates for this vacancy right now.</p>
            <button
              type="button"
              onClick={handleChangeVacancy}
              className="mt-6 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View another vacancy
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
