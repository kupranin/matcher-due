"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function EmployerRegisterPage() {
  const t = useTranslations("employerRegister");
  const tCommon = useTranslations("common");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTaken, setEmailTaken] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const router = useRouter();

  const canSubmit =
    companyName.trim().length >= 2 &&
    companyId.trim().length >= 2 &&
    isValidEmail(email) &&
    password.length >= 8 &&
    !emailTaken &&
    !isSubmitting;

  async function checkEmailTaken(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!normalized || !isValidEmail(normalized)) {
      setEmailTaken(null);
      return;
    }
    setEmailChecking(true);
    setEmailTaken(null);
    try {
      const res = await fetch(
        `/api/auth/check-email?email=${encodeURIComponent(normalized)}&role=EMPLOYER`
      );
      const data = await res.json().catch(() => ({}));
      if (data.taken && typeof data.message === "string") {
        setEmailTaken(data.message);
      } else {
        setEmailTaken(null);
      }
    } catch {
      setEmailTaken(null);
    } finally {
      setEmailChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setRegisterError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/employer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          companyName: companyName.trim(),
          companyId: companyId.trim() || "N/A",
          contactEmail: email.trim().toLowerCase(),
          contactPhone: phone.trim() || "",
        }),
      });
      let data: { error?: string; hint?: string; userId?: string; companyId?: string; token?: string } = {};
      try {
        data = await res.json();
      } catch {
        setRegisterError(res.status >= 500 ? "Server error. Try again or check your deployment logs." : "Registration failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Registration failed. Please try again.";
        const hint = typeof data?.hint === "string" ? ` ${data.hint}` : "";
        setRegisterError(msg + hint);
        setIsSubmitting(false);
        return;
      }
      const userId = data.userId;
      const companyIdFromReg = data.companyId;
      const token = typeof data.token === "string" ? data.token : null;
      if (typeof window !== "undefined") {
        if (token) window.sessionStorage.setItem("matcher_employer_token", token);
        window.sessionStorage.removeItem("employerHasSubscription");
        if (userId) window.sessionStorage.setItem("matcher_employer_user_id", userId);
        window.sessionStorage.setItem("employerLoggedIn", "1");
        if (companyIdFromReg) {
          window.sessionStorage.setItem("matcher_employer_company_id", companyIdFromReg);
          window.sessionStorage.setItem("matcher_employer_company_name", companyName.trim());
        }
      }
      router.push("/employer/post?registered=1");
      return;
    } catch (e) {
      const err = e as Error;
      setRegisterError(err?.message?.includes("fetch") ? "Network error. Check your connection and try again." : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo height={80} />
          <Link href="/employer" className="text-sm text-gray-600 hover:text-gray-900">
            {tCommon("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{t("title")}</h1>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("companyName")}</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("companyNamePlaceholder")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  companyName.length > 0 && companyName.trim().length < 2 ? "border-red-300" : "border-gray-200"
                }`}
              />
              {companyName.length > 0 && companyName.trim().length < 2 && (
                <p className="mt-2 text-xs text-red-600">{t("minTwoChars")}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("companyId")}</label>
              <input
                type="text"
                inputMode="numeric"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value.replace(/[^\d]/g, ""))}
                placeholder={t("companyIdPlaceholder")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  companyId.length > 0 && companyId.trim().length < 2 ? "border-red-300" : "border-gray-200"
                }`}
              />
              {companyId.length > 0 && companyId.trim().length < 2 && (
                <p className="mt-2 text-xs text-red-600">{t("enterCompanyId")}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("contactEmail")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailTaken(null);
                }}
                onBlur={() => checkEmailTaken(email)}
                placeholder={t("contactEmailPlaceholder")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  email.length > 0 && !isValidEmail(email)
                    ? "border-red-300"
                    : emailTaken
                      ? "border-red-300"
                      : "border-gray-200"
                }`}
              />
              {email.length > 0 && !isValidEmail(email) && (
                <p className="mt-2 text-xs text-red-600">{t("validEmail")}</p>
              )}
              {emailChecking && (
                <p className="mt-2 text-xs text-gray-500">Checking email…</p>
              )}
              {emailTaken && !emailChecking && (
                <p className="mt-2 text-xs text-red-600">{emailTaken}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("contactPhone")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+995 5xx xx xx xx"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              />
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  password.length > 0 && password.length < 8 ? "border-red-300" : "border-gray-200"
                }`}
              />
              {password.length > 0 && password.length < 8 && (
                <p className="mt-2 text-xs text-red-600">{t("passwordMin")}</p>
              )}
            </div>

            {registerError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {registerError}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                canSubmit ? "bg-matcher text-white hover:bg-matcher-dark" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (tCommon("saving") ?? "Saving…") : t("submit")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {t("alreadyRegistered")}{" "}
            <Link href="/login" className="font-medium text-matcher-dark hover:text-matcher">
              {t("logIn")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
