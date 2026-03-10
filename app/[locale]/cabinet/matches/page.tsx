"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCandidateProfileId, loadCandidateProfile } from "@/lib/candidateProfileStorage";
import type { MutualMatch } from "@/lib/matchStorage";

type MatchSummary = MutualMatch;

export default function CandidateMatchesPage() {
  const tChats = useTranslations("chats");
  const [matches, setMatches] = useState<MatchSummary[]>([]);

  useEffect(() => {
    const profileId = getCandidateProfileId();
    const stored = loadCandidateProfile();
    if (!profileId) return;

    fetch(`/api/matches?candidateProfileId=${encodeURIComponent(profileId)}`)
      .then((r) => r.json())
      .then(
        (
          list: Array<{
            id: string;
            matchId: string;
            vacancyId: string;
            candidateProfileId: string;
            vacancyTitle: string;
            companyName: string;
            matchedAt: string | null;
            createdAt?: string;
          }>
        ) => {
          if (!Array.isArray(list)) return;
          const mapped: MatchSummary[] = list.map((m) => ({
            id: m.matchId || m.id,
            vacancyId: m.vacancyId,
            candidateId: m.candidateProfileId,
            candidateName: stored?.fullName ?? "",
            vacancyTitle: m.vacancyTitle,
            company: m.companyName,
            createdAt: m.matchedAt
              ? new Date(m.matchedAt).getTime()
              : m.createdAt
              ? new Date(m.createdAt).getTime()
              : Date.now(),
          }));
          setMatches(mapped);
        }
      )
      .catch(() => {});
  }, []);

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 md:py-16">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center sm:p-10 md:p-12">
          <p className="text-5xl">✨</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{tChats("noMatchesYet")}</h2>
          <p className="mt-2 text-gray-600">{tChats("keepSwipingHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-5 sm:py-6 md:py-8">
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{tChats("yourMatches")}</h1>
      <p className="mt-1 text-gray-600">{tChats("chatHint")}</p>

      <div className="mt-6 space-y-3">
        {matches.map((m) => (
          <div
            key={m.id}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{m.company}</p>
              <p className="text-sm text-gray-600">{m.vacancyTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

