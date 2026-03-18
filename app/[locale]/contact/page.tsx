"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={isDark ? "relative min-h-screen bg-[#070B12] text-white" : "relative min-h-screen bg-white text-gray-900"}>
      <div
        className={
          isDark
            ? "pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(139,195,74,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,173,181,0.14),transparent_55%)]"
            : "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/40 via-white to-white"
        }
      />

      <header className={isDark ? "border-b border-white/10 bg-black/40 backdrop-blur-sm" : "border-b border-gray-100/80 bg-white/80 backdrop-blur-sm"}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/"
              className={
                isDark
                  ? "shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/15"
                  : "shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
              }
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <h1 className={isDark ? "text-3xl font-bold tracking-tight text-white sm:text-4xl" : "text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"}>
          {t("title")}
        </h1>
        <p className={isDark ? "mt-3 text-white/70 sm:text-lg" : "mt-3 text-gray-600 sm:text-lg"}>
          {t("subtitle")}
        </p>

        <div
          className={
            isDark
              ? "mt-10 space-y-6 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-sm sm:p-8"
              : "mt-10 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          }
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t("email")}
            </p>
            <a
              href="mailto:keti@matcher.ge"
              className="mt-1 block text-lg font-medium text-matcher-dark transition hover:underline"
            >
              keti@matcher.ge
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t("phone")}
            </p>
            <a
              href="tel:+995599620426"
              className="mt-1 block text-lg font-medium text-matcher-dark transition hover:underline"
            >
              +995 599 62 04 26
            </a>
          </div>
          <p className={isDark ? "text-sm text-white/60" : "text-sm text-gray-500"}>
            {t("hint")}
          </p>
        </div>

        <div className="mt-12">
          <h2 className={isDark ? "text-xl font-semibold text-white" : "text-xl font-semibold text-gray-900"}>
            {t("formTitle")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className={
              isDark
                ? "mt-6 space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-sm sm:p-8"
                : "mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            }
          >
            <div>
              <label htmlFor="contact-name" className={isDark ? "block text-sm font-medium text-white/80" : "block text-sm font-medium text-gray-700"}>
                {t("name")}
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className={
                  isDark
                    ? "mt-1 block w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                    : "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                }
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={isDark ? "block text-sm font-medium text-white/80" : "block text-sm font-medium text-gray-700"}>
                {t("email")}
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={
                  isDark
                    ? "mt-1 block w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                    : "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                }
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className={isDark ? "block text-sm font-medium text-white/80" : "block text-sm font-medium text-gray-700"}>
                {t("subject")}
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("subjectPlaceholder")}
                className={
                  isDark
                    ? "mt-1 block w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                    : "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                }
              />
            </div>
            <div>
              <label htmlFor="contact-message" className={isDark ? "block text-sm font-medium text-white/80" : "block text-sm font-medium text-gray-700"}>
                {t("message")}
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
                className={
                  isDark
                    ? "mt-1 block w-full min-h-[100px] resize-y rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                    : "mt-1 block w-full min-h-[100px] resize-y rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
                }
              />
            </div>
            {status === "success" && (
              <p className="text-sm font-medium text-green-700">
                {t("successMessage")}
              </p>
            )}
            {status === "error" && (
              <p className="text-sm font-medium text-red-600">
                {t("errorMessage")}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-matcher px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-matcher-dark focus:outline-none focus:ring-2 focus:ring-matcher focus:ring-offset-2 disabled:opacity-70 sm:w-auto sm:min-w-[160px]"
            >
              {status === "sending" ? t("sending") : t("submit")}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
