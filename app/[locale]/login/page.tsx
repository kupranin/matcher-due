"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";

type UserType = "candidate" | "business" | null;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginPage() {
  const t = useTranslations("login");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit =
    userType &&
    isValidEmail(email) &&
    password.length >= 8;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    // MVP: redirect to cabinet based on user type — wire to auth later
    if (userType === "candidate") router.push("/cabinet");
    else router.push("/employer/cabinet");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:py-4">
          <Logo height={72} />
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              {tCommon("backToHome")}
            </Link>
          </div>
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("iAm")}</label>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("candidate")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    userType === "candidate"
                      ? "border-matcher bg-matcher-mint text-matcher-dark"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {t("candidate")}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("business")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    userType === "business"
                      ? "border-matcher bg-matcher-mint text-matcher-dark"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {t("business")}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  email.length > 0 && !isValidEmail(email) ? "border-red-300" : "border-gray-200"
                }`}
              />
              {email.length > 0 && !isValidEmail(email) && (
                <p className="mt-2 text-xs text-red-600">Please enter a valid email.</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  password.length > 0 && password.length < 8 ? "border-red-300" : "border-gray-200"
                }`}
              />
              {password.length > 0 && password.length < 8 && (
                <p className="mt-2 text-xs text-red-600">Password must be at least 8 characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                canSubmit
                  ? "bg-matcher text-white hover:bg-matcher-dark"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {t("submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("noAccount")}{" "}
            <Link href="/userFlow/1" className="font-medium text-matcher-dark hover:text-matcher">
              Create one
            </Link>
            {" · "}
            <Link href="/employer/register" className="font-medium text-matcher-dark hover:text-matcher">
              {t("registerCompany")}
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            <Link href="/cabinet" className="font-medium text-matcher-dark hover:text-matcher">
              {t("candidateCabinet")}
            </Link>
            {" · "}
            <Link href="/employer/cabinet" className="font-medium text-matcher-dark hover:text-matcher">
              {t("employerCabinet")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
