"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  getChatMessages,
  addChatMessage,
  type ChatMessage,
} from "@/lib/chatStorage";
import { buildGoogleCalendarUrl } from "@/lib/googleCalendar";
import type { MutualMatch } from "@/lib/matchStorage";

const SUGGESTED_MESSAGES = [
  "When are you available for an interview?",
  "Let's schedule a call this week",
  "I can do Tuesday or Wednesday afternoon",
  "Looking forward to connecting!",
];

export default function MatchChatWindow({
  match,
  userRole,
  onClose,
}: {
  match: MutualMatch;
  userRole: "candidate" | "employer";
  onClose: () => void;
}) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleDuration, setScheduleDuration] = useState(60);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const otherName = userRole === "candidate" ? match.company : match.candidateName;
  const defaultTitle = `Interview: ${match.vacancyTitle} with ${otherName}`;

  useEffect(() => {
    setMessages(getChatMessages(match.id));
  }, [match.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    const sender = userRole;
    const msg = addChatMessage(match.id, sender, text);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  }

  function handleSuggested(msg: string) {
    const sender = userRole;
    const message = addChatMessage(match.id, sender, msg);
    setMessages((prev) => [...prev, message]);
  }

  function handleOpenCalendar() {
    const [year, month, day] = scheduleDate.split("-").map(Number);
    const [hour, min] = scheduleTime.split(":").map(Number);
    const start = new Date(year, month - 1, day, hour, min);
    const end = new Date(start.getTime() + scheduleDuration * 60 * 1000);
    const title = scheduleTitle.trim() || defaultTitle;
    const url = buildGoogleCalendarUrl({
      title,
      startDate: start,
      endDate: end,
      details: `${match.vacancyTitle} — Chat with ${otherName}`,
      location: scheduleLocation.trim() || undefined,
    });
    window.open(url, "_blank", "noopener,noreferrer");
    setShowScheduler(false);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Chat with {otherName}
          </h3>
          <p className="text-sm text-gray-500">{match.vacancyTitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowScheduler(true)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-matcher-dark hover:bg-matcher-mint"
            title={t("openCalendar")}
          >
            📅 {t("schedule")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scheduler modal */}
      <AnimatePresence>
        {showScheduler && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowScheduler(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
            >
              <h4 className="text-lg font-semibold text-gray-900">
                📅 {t("addToCalendar")}
              </h4>
              <p className="mt-1 text-sm text-gray-500">{t("openCalendar")}</p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("eventTitle")}
                  </label>
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder={t("eventTitlePlaceholder", { name: otherName })}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("date")}
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={today}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t("time")}
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("duration")}
                  </label>
                  <select
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  >
                    <option value={30}>{t("durationMinutes", { minutes: 30 })}</option>
                    <option value={60}>{t("durationMinutes", { minutes: 60 })}</option>
                    <option value={90}>{t("durationMinutes", { minutes: 90 })}</option>
                    <option value={120}>{t("durationMinutes", { minutes: 120 })}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("location")}
                  </label>
                  <input
                    type="text"
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    placeholder={t("locationPlaceholder")}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduler(false)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleOpenCalendar}
                  disabled={!scheduleDate}
                  className="flex-1 rounded-xl bg-matcher px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-matcher-dark disabled:hover:bg-matcher"
                >
                  {t("addToCalendar")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex h-80 flex-col overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-500">Schedule your next steps with {otherName}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  type="button"
                  onClick={() => handleSuggested(msg)}
                  className="rounded-full border border-matcher bg-matcher-pale/50 px-4 py-2 text-sm font-medium text-matcher-dark hover:bg-matcher-mint"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === userRole ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    m.sender === userRole
                      ? "bg-matcher text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-gray-100 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="rounded-xl bg-matcher px-4 py-2 font-medium text-white disabled:opacity-50 hover:bg-matcher-dark disabled:hover:bg-matcher"
        >
          Send
        </button>
      </div>
    </motion.div>
  );
}
