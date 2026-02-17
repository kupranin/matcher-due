"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { MutualMatch } from "@/lib/matchStorage";

export default function MatchCongratulationsModal({
  match,
  onClose,
  onOpenChat,
}: {
  match: MutualMatch | null;
  onClose: () => void;
  onOpenChat: () => void;
}) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="text-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-7xl"
              >
                🎉
              </motion.span>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">It&apos;s a match!</h2>
              <p className="mt-2 text-gray-600">
                <span className="font-semibold text-matcher-dark">{match.company}</span> liked you for{" "}
                <span className="font-semibold">{match.vacancyTitle}</span>. Time to schedule next steps!
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="rounded-xl bg-matcher px-6 py-3 font-semibold text-white shadow-lg hover:bg-matcher-dark"
                >
                  Open chat to schedule
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
