"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getMutualMatches, type MutualMatch } from "@/lib/matchStorage";
import MatchChatWindow from "@/components/MatchChatWindow";

export default function CandidateChatsPage() {
  const t = useTranslations("chats");
  const [matches, setMatches] = useState<MutualMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MutualMatch | null>(null);

  useEffect(() => {
    setMatches(getMutualMatches());
  }, []);

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-14 md:py-16">
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center sm:p-10 md:p-12">
          <p className="text-5xl">💬</p>
          <h2 className="mt-4 text-xl font-bold text-gray-900">{t("noMatchesYet")}</h2>
          <p className="mt-2 text-gray-600">
            {t("noMatchesHint")}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            {t("keepSwipingHint")}
          </p>
        </div>
      </div>
    );
  }

  if (selectedMatch) {
    return (
      <div className="mx-auto max-w-md px-4 py-5 sm:py-6 md:py-8">
        <AnimatePresence>
          <MatchChatWindow
            key={selectedMatch.id}
            match={selectedMatch}
            userRole="candidate"
            onClose={() => setSelectedMatch(null)}
          />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-5 sm:py-6 md:py-8">
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{t("yourMatches")}</h1>
      <p className="mt-1 text-gray-600">
        {t("chatHint")}
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
              💼
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{match.company}</p>
              <p className="text-sm text-gray-600">{match.vacancyTitle}</p>
            </div>
            <span className="text-matcher">{t("chat")}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
