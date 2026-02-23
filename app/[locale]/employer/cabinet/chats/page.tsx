"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import type { MutualMatch } from "@/lib/matchStorage";
import MatchChatWindow from "@/components/MatchChatWindow";

export default function EmployerChatsPage() {
  const t = useTranslations("chats");
  const [matches, setMatches] = useState<(MutualMatch & { candidateJobTitle?: string | null })[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MutualMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Resolve company from session (same as cabinet) so we always use the current employer's company.
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user: { id?: string; role: string } | null }) => {
        if (cancelled || !data?.user?.id || data.user.role !== "EMPLOYER") {
          setLoading(false);
          return;
        }
        return fetch(`/api/companies?userId=${encodeURIComponent(data.user.id)}`)
          .then((r) => r.json())
          .then((company: { id?: string } | null) => {
            if (cancelled) return;
            const companyId = company?.id ?? null;
            if (companyId && typeof window !== "undefined") {
              window.sessionStorage.setItem("matcher_employer_company_id", companyId);
            }
            if (!companyId) {
              setMatches([]);
              setLoading(false);
              return;
            }
            return fetch(`/api/matches?companyId=${encodeURIComponent(companyId)}`)
              .then((res) => res.json())
              .then((list: Array<{ id: string; vacancyId: string; candidateProfileId: string; candidateLiked: boolean; employerLiked: boolean; vacancyTitle: string; company: string; candidateName: string; candidateJobTitle?: string | null; createdAt: string }>) => {
                if (cancelled) return;
                const mutual = (Array.isArray(list) ? list : [])
                  .filter((m) => m.candidateLiked && m.employerLiked)
                  .map((m) => ({
                    id: m.id,
                    vacancyId: m.vacancyId,
                    candidateId: m.candidateProfileId,
                    candidateName: m.candidateName ?? "Candidate",
                    candidateJobTitle: m.candidateJobTitle ?? null,
                    vacancyTitle: m.vacancyTitle,
                    company: m.company,
                    createdAt: new Date(m.createdAt).getTime(),
                  }));
                setMatches(mutual);
              })
              .finally(() => { if (!cancelled) setLoading(false); });
          })
          .catch(() => { if (!cancelled) setLoading(false); });
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, []);

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
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-matcher-mint text-xl">
              👤
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">
                {match.candidateJobTitle ? `${match.candidateName} · ${match.candidateJobTitle}` : match.candidateName}
              </p>
              <p className="text-sm text-gray-600">{match.vacancyTitle} · {match.company}</p>
            </div>
            <span className="text-matcher">{t("chat")}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
