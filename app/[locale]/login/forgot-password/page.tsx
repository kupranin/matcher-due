"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !isValidEmail(email) || status === "loading") return;
    setStatus("loading");
    setMessage("");
    setResetLink(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || t("errorGeneric"));
        return;
      }
      setStatus("success");
      setMessage(data.message || t("successMessage"));
      if (data.resetLink) setResetLink(data.resetLink);
    } catch {
      setStatus("error");
      setMessage(t("errorGeneric"));
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
          <Logo height={72} />
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            {tCommon("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8 sm:py-12 md:py-16">
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t("subtitle")}
          </p>

          {status === "success" ? (
            <div className="mt-8 space-y-4">
              <p className="rounded-xl bg-matcher-mint/50 px-4 py-3 text-sm text-gray-800">
                {message}
              </p>
              {resetLink && (
                <p className="text-sm text-gray-600">
                  {t("devLinkLabel")}{" "}
                  <a
                    href={resetLink}
                    className="font-medium text-matcher-dark underline hover:text-matcher"
                  >
                    {t("devLinkAction")}
                  </a>
                </p>
              )}
              <Link
                href="/login"
                className="inline-block rounded-2xl bg-matcher px-5 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
              >
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-900">{t("emailLabel")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={status === "loading"}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 disabled:opacity-70"
                />
              </div>
              {status === "error" && message && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={!email.trim() || !isValidEmail(email) || status === "loading"}
                className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  email.trim() && isValidEmail(email) && status !== "loading"
                    ? "bg-matcher text-white hover:bg-matcher-dark"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                {status === "loading" ? t("sending") : t("submit")}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="font-medium text-matcher-dark hover:text-matcher">
              {t("backToLogin")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
