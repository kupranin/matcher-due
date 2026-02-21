"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) setStatus("error");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || password.length < 8 || password !== confirm || status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || t("errorGeneric"));
        return;
      }
      setStatus("success");
      setMessage(data.message || t("successMessage"));
      setTimeout(() => router.replace("/login"), 2000);
    } catch {
      setStatus("error");
      setMessage(t("errorGeneric"));
    }
  }

  if (!token) {
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
        <main className="mx-auto max-w-md px-4 py-12">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-red-600">{t("invalidOrExpired")}</p>
            <Link href="/login/forgot-password" className="mt-4 inline-block text-matcher-dark hover:underline">
              {t("requestNew")}
            </Link>
          </div>
        </main>
      </div>
    );
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
            <p className="mt-8 rounded-xl bg-matcher-mint/50 px-4 py-3 text-sm text-gray-800">
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-900">{t("passwordLabel")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  minLength={8}
                  disabled={status === "loading"}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 disabled:opacity-70"
                />
                {password.length > 0 && password.length < 8 && (
                  <p className="mt-1 text-xs text-red-600">{t("passwordMin")}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900">{t("confirmLabel")}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("confirmPlaceholder")}
                  disabled={status === "loading"}
                  className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 disabled:opacity-70 ${
                    confirm.length > 0 && password !== confirm ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {confirm.length > 0 && password !== confirm && (
                  <p className="mt-1 text-xs text-red-600">{t("confirmMismatch")}</p>
                )}
              </div>
              {status === "error" && message && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={
                  password.length < 8 ||
                  password !== confirm ||
                  status === "loading"
                }
                className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  password.length >= 8 && password === confirm && status !== "loading"
                    ? "bg-matcher text-white hover:bg-matcher-dark"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                {status === "loading" ? t("saving") : t("submit")}
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
