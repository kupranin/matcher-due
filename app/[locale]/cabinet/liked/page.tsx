"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCandidateProfileId } from "@/lib/candidateProfileStorage";
import { loadCandidateProfile } from "@/lib/candidateProfileStorage";

type LikedMatch = {
  id: string;
  vacancyId: string;
  candidateProfileId: string;
  candidateLiked: boolean;
  employerLiked: boolean;
  vacancyTitle: string;
  company: string;
  matchScore?: number;
  createdAt: string;
};

function LikedJobCard({
  item,
  tLiked,
}: {
  item: LikedMatch;
  tLiked: (key: string, values?: Record<string, string | number>) => string;
}) {
  const isMatched = item.employerLiked;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-matcher/30 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-bold text-gray-900">{item.vacancyTitle}</h3>
          <p className="mt-0.5 text-sm font-medium text-gray-600">{item.company}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.matchScore != null && (
              <span className="rounded-full bg-matcher-mint px-3 py-1 text-xs font-semibold text-matcher-dark">
                {tLiked("matchScore", { percent: item.matchScore })}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isMatched ? "bg-matcher/15 text-matcher-dark" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isMatched ? tLiked("matched") : tLiked("pending")}
            </span>
          </div>
        </div>
        {isMatched && (
          <Link
            href={`/cabinet/chats?matchId=${encodeURIComponent(item.id)}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-matcher px-4 py-3 font-medium text-white shadow-sm transition hover:bg-matcher-teal focus:outline-none focus:ring-2 focus:ring-matcher focus:ring-offset-2"
          >
            <span aria-hidden>💬</span>
            {tLiked("chat")}
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export default function CabinetLikedPage() {
  const tLiked = useTranslations("likedJobs");
  const [items, setItems] = useState<LikedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileId = getCandidateProfileId();
    if (!profileId) {
      setLoading(false);
      return;
    }
    fetch(`/api/matches?candidateProfileId=${encodeURIComponent(profileId)}`)
      .then((r) => r.json())
      .then((list: LikedMatch[]) => {
        if (Array.isArray(list)) {
          setItems(list.filter((m) => m.candidateLiked));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-matcher border-t-transparent" />
          <p className="text-sm text-gray-500">{tLiked("loading")}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 md:py-16">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center sm:p-10 md:p-12">
          <p className="text-5xl">♥</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{tLiked("empty")}</h2>
          <p className="mt-2 text-gray-600">{tLiked("emptyHint")}</p>
          <Link
            href="/cabinet"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-matcher px-5 py-3 font-medium text-white transition hover:bg-matcher-teal"
          >
            {tLiked("browseOpportunities")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-5 sm:py-6 md:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/40 to-transparent" />
      <h1 className="font-heading text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{tLiked("title")}</h1>
      <p className="mt-2 text-gray-600">{tLiked("subtitle")}</p>

      <div className="mt-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <LikedJobCard key={item.id} item={item} tLiked={tLiked} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
