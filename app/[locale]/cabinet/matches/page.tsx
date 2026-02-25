"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCandidateProfileId } from "@/lib/candidateProfileStorage";

type MatchItem = {
  id: string;
  vacancyId: string;
  candidateProfileId: string;
  candidateLiked: boolean;
  employerLiked: boolean;
  vacancyTitle: string;
  company: string;
  createdAt: string;
};

export default function CandidateMatchesPage() {
  const t = useTranslations("chats");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = getCandidateProfileId();
    if (!profileId) {
      setLoading(false);
      return;
    }
    fetch(`/api/matches?candidateProfileId=${encodeURIComponent(profileId)}`)
      .then((r) => r.json())
      .then((list: MatchItem[]) => {
        const mutual = (Array.isArray(list) ? list : []).filter(
          (m) => m.candidateLiked && m.employerLiked
        );
        setMatches(mutual);
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
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
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 md:py-16">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center sm:p-10 md:p-12">
          <p className="text-5xl">💬</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{t("noMatchesYet")}</h2>
          <p className="mt-2 text-gray-600">{t("noMatchesHint")}</p>
          <p className="mt-4 text-sm text-gray-500">{t("keepSwipingHint")}</p>
          <Link
            href="/cabinet"
            className="mt-6 inline-block rounded-xl bg-matcher px-6 py-3 font-semibold text-white hover:bg-matcher-dark"
          >
            {t("browseOpportunities")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("yourMatches")}</h1>
      <p className="mt-1 text-gray-600">{t("chatHint")}</p>

      <div className="mt-6 space-y-3">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/cabinet/chats?matchId=${encodeURIComponent(match.id)}`}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-matcher hover:bg-matcher-pale/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-matcher-mint text-xl">
              💼
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{match.company}</p>
              <p className="text-sm text-gray-600">{match.vacancyTitle}</p>
            </div>
            <span className="text-matcher font-medium">{t("chat")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
