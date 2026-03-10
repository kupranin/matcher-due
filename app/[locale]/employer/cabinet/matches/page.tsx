"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const AVATAR_PLACEHOLDER = "/images/avatar-placeholder.svg";

function getAvatarSrc(photoUrl: string | null | undefined): string {
  if (photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0) {
    return photoUrl.trim();
  }
  return AVATAR_PLACEHOLDER;
}

type MatchApiRow = {
  matchId?: string;
  id?: string;
  vacancyId?: string;
  candidateProfileId?: string;
  candidateName?: string;
  candidatePhotoUrl?: string;
  vacancyTitle?: string;
  companyName?: string;
  matchedAt?: string;
  createdAt?: string;
};

type MatchRow = {
  matchId: string;
  vacancyId: string;
  candidateProfileId: string;
  candidateName: string | null;
  candidatePhotoUrl: string | null;
  vacancyTitle: string;
  companyName: string;
  matchedAt: string | null;
  createdAt: string;
};

function toMatchRow(m: MatchApiRow): MatchRow {
  return {
    matchId: typeof m.matchId === "string" ? m.matchId : typeof m.id === "string" ? m.id : "",
    vacancyId: typeof m.vacancyId === "string" ? m.vacancyId : "",
    candidateProfileId: typeof m.candidateProfileId === "string" ? m.candidateProfileId : "",
    candidateName: typeof m.candidateName === "string" ? m.candidateName : null,
    candidatePhotoUrl: typeof m.candidatePhotoUrl === "string" ? m.candidatePhotoUrl : null,
    vacancyTitle: typeof m.vacancyTitle === "string" ? m.vacancyTitle : "",
    companyName: typeof m.companyName === "string" ? m.companyName : "",
    matchedAt: typeof m.matchedAt === "string" ? m.matchedAt : null,
    createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date().toISOString(),
  };
}

export default function EmployerMatchesPage() {
  const t = useTranslations("chats");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches", { credentials: "include" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setMatches([]);
          return;
        }
        const rows = data as MatchApiRow[];
        setMatches(rows.map(toMatchRow));
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
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-matcher-pale/80 text-5xl">
            ♥
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">{t("noMatchesYet")}</h2>
          <p className="mt-3 text-gray-600">
            When you and a candidate like each other, they will appear here.
          </p>
          <p className="mt-4 text-sm text-gray-500">{t("keepSwipingHintEmployer")}</p>
          <Link
            href="/employer/cabinet"
            className="mt-6 inline-block rounded-xl bg-matcher px-6 py-3.5 font-semibold text-white shadow-lg shadow-matcher/20 hover:bg-matcher-dark transition-colors"
          >
            Browse candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t("yourMatches")}</h1>
      <p className="mt-1 text-gray-600">{t("chatHintEmployer")}</p>

      <div className="mt-6 space-y-3">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            href={`/employer/cabinet/chats?matchId=${encodeURIComponent(match.matchId)}`}
            className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-matcher hover:bg-matcher-pale/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              <img
                src={getAvatarSrc(match.candidatePhotoUrl)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = AVATAR_PLACEHOLDER;
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{match.candidateName ?? "Candidate"}</p>
              <p className="truncate text-sm text-gray-600">
                {match.vacancyTitle} · {match.companyName}
              </p>
            </div>
            <span className="text-matcher font-medium">{t("chat")}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
