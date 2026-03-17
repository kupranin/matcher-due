 "use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCandidateProfileId, getCandidateUserId, loadCandidateProfile } from "@/lib/candidateProfileStorage";
import type { MutualMatch } from "@/lib/matchStorage";

type MatchSummary = MutualMatch;

export default function CandidateMatchesPage() {
  const tChats = useTranslations("chats");
  const [matches, setMatches] = useState<MatchSummary[]>([]);

  useEffect(() => {
    async function load() {
      let profileId = getCandidateProfileId();
      const stored = loadCandidateProfile();

      // Fallback: resolve profileId via userId + session if not in localStorage.
      if (!profileId) {
        let userId = getCandidateUserId();
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
            // ignore
          }
        }
        if (userId) {
          try {
            const res = await fetch(`/api/candidates/profile?userId=${encodeURIComponent(userId)}`);
            const data = (await res.json().catch(() => null)) as { profileId?: string } | null;
            if (data?.profileId) {
              profileId = data.profileId;
              if (typeof window !== "undefined") {
                window.localStorage.setItem("matcher_candidate_profile_id", profileId);
              }
            }
          } catch {
            // ignore
          }
        }
      }

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
    }

    void load();
  }, []);

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 md:py-16">
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-10 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-matcher-pale/80 text-5xl">
            ✨
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">{tChats("noMatchesYet")}</h2>
          <p className="mt-3 text-gray-600">
            When you and a company like each other, they will appear here.
          </p>
          <p className="mt-4 text-sm text-gray-500">{tChats("keepSwipingHint")}</p>
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
            <Link
              href={`/cabinet/chats?matchId=${encodeURIComponent(m.id)}`}
              className="ml-4 rounded-full bg-matcher px-4 py-2 text-sm font-semibold text-white shadow hover:bg-matcher-dark"
            >
              {tChats("chat")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

