"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PITCH_MAX = 140;

export default function PitchModal({
  company,
  vacancyTitle,
  onSubmit,
  onSkip,
}: {
  company: string;
  vacancyTitle: string;
  onSubmit: (pitch: string) => void;
  onSkip?: () => void;
}) {
  const [pitch, setPitch] = useState("");

  const valid = pitch.trim().length >= 10 && pitch.length <= PITCH_MAX;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit(pitch.trim());
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={() => onSkip?.()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8"
        >
          <h2 className="font-heading text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Quick pitch to {company}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {vacancyTitle} — prove you’re interested. Employers see this.
          </p>
          <form onSubmit={handleSubmit} className="mt-6">
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value.slice(0, PITCH_MAX))}
              placeholder="e.g. I’m free this weekend and love coffee — would love to chat!"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-matcher focus:ring-2 focus:ring-matcher/20"
              maxLength={PITCH_MAX}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{pitch.length} / {PITCH_MAX}</span>
              {pitch.trim().length > 0 && pitch.trim().length < 10 && (
                <span className="text-amber-600">Min 10 characters</span>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Skip
                </button>
              )}
              <button
                type="submit"
                disabled={!valid}
                className="flex-1 rounded-xl bg-matcher py-3 text-sm font-semibold text-white shadow transition hover:bg-matcher-dark disabled:opacity-50"
              >
                Send & match
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
