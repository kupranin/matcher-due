"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ContactPage() {
  const t = useTranslations("contactPage");
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
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-matcher-pale/40 via-white to-white" />

      <header className="border-b border-gray-100/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/"
              className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-matcher hover:bg-matcher-pale hover:text-matcher-dark"
            >
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-gray-600 sm:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-10 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
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
          <p className="text-sm text-gray-500">
            {t("hint")}
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("formTitle")}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">
                {t("name")}
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700">
                {t("subject")}
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("subjectPlaceholder")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">
                {t("message")}
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-matcher focus:ring-1 focus:ring-matcher resize-y min-h-[100px]"
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
