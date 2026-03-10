"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { MutualMatch } from "@/lib/matchStorage";
import MatchChatWindow from "@/components/MatchChatWindow";

type MatchRow = MutualMatch & { 
  candidateJobTitle?: string | null;
  candidatePhotoUrl?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
};

const AVATAR_PLACEHOLDER_PATH = "/images/avatar-placeholder.svg";
function getAvatarSrc(photoUrl: string | null | undefined): string {
  if (photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0) {
    return photoUrl.trim();
  }
  return AVATAR_PLACEHOLDER_PATH;
}

function EmployerChatsContent() {
  const t = useTranslations("chats");
  const searchParams = useSearchParams();
  const matchIdFromUrl = searchParams.get("matchId");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchRow | null>(null);
  const [loading, setLoading] = useState(true);

  function getEmployerAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = window.sessionStorage.getItem("matcher_employer_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function fetchMatches() {
    const opts = { credentials: "include" as RequestCredentials, ...(Object.keys(getEmployerAuthHeaders()).length ? { headers: getEmployerAuthHeaders() } : {}) };
    return fetch("/api/matches", opts)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data: list }) => {
        if (!ok || !Array.isArray(list)) {
          setMatches([]);
          return;
        }
        const mutual = list.map(m => ({
          id: m.matchId || m.id,
          vacancyId: m.vacancyId,
          candidateId: m.candidateProfileId,
          candidateName: m.candidateName ?? "Candidate",
          candidateJobTitle: m.candidateJobTitle ?? null,
          candidatePhotoUrl: m.candidatePhotoUrl ?? null,
          vacancyTitle: m.vacancyTitle,
          company: m.companyName || m.company,
          createdAt: new Date(m.createdAt || m.matchedAt || Date.now()).getTime(),
          lastMessageText: m.lastMessageText,
          lastMessageAt: m.lastMessageAt
        }));
        setMatches(mutual);
      })
      .catch(() => setMatches([]));
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMatches().finally(() => { if (!cancelled) setLoading(false); });
    const onReady = () => fetchMatches();
    window.addEventListener("employer-company-ready", onReady);
    return () => {
      cancelled = true;
      window.removeEventListener("employer-company-ready", onReady);
    };
  }, []);

  useEffect(() => {
    if (!matchIdFromUrl || matches.length === 0) return;
    const match = matches.find((m) => m.id === matchIdFromUrl);
    if (match) setSelectedMatch(match);
  }, [matchIdFromUrl, matches]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-matcher border-t-transparent" aria-hidden />
          <p className="mt-4 text-gray-600">{t("loadingMatches")}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-5xl">💬</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{t("noMatchesYet")}</h2>
          <p className="mt-2 text-gray-600">
            {t("noMatchesHintEmployer")}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            {t("keepSwipingHintEmployer")}
          </p>
        </div>
      </div>
    );
  }

  if (selectedMatch) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <button
          onClick={() => setSelectedMatch(null)}
          className="mb-4 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          ← Back to matches
        </button>
        <AnimatePresence>
          <MatchChatWindow
            key={selectedMatch.id}
            match={selectedMatch}
            userRole="employer"
            onClose={() => setSelectedMatch(null)}
          />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("yourMatches")}</h1>
      <p className="mt-1 text-gray-600">
        {t("chatHintEmployer")}
      </p>

      <div className="mt-6 space-y-3">
        {matches.map((match) => (
          <motion.button
            key={match.id}
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedMatch(match)}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-matcher hover:bg-matcher-pale/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-matcher-mint">
              <img
                src={getAvatarSrc(match.candidatePhotoUrl)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/avatar-placeholder.svg";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">
                {match.candidateName}
              </p>
              <p className="truncate text-sm text-gray-600">
                {match.vacancyTitle} · {match.company}
              </p>
              {match.lastMessageText && (
                <p className="mt-1 truncate text-xs text-gray-500 font-medium">
                  {match.lastMessageText}
                </p>
              )}
            </div>
            <span className="text-matcher">{t("chat")}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function EmployerChatsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EmployerChatsContent />
    </Suspense>
  );
}
