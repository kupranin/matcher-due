"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 9;
}

export default function EmployerRegisterPage() {
  const t = useTranslations("employerRegister");
  const tCommon = useTranslations("common");
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState<"phone" | "email">("phone");

  const canSubmit =
    companyName.trim().length >= 2 &&
    companyId.trim().length >= 2 &&
    isValidEmail(email) &&
    isValidPhone(phone) &&
    password.length >= 8;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setOtp("");
    setOtpOpen(true);
  }

  function fakeSendOtp(to: "phone" | "email") {
    setOtpSentTo(to);
    setOtp("");
    setOtpOpen(true);
  }

  const router = useRouter();
  const [registerError, setRegisterError] = useState("");

  async function fakeVerifyOtp() {
    const digits = otp.replace(/[^\d]/g, "");
    if (digits.length < 4) return;
    setOtpOpen(false);
    setRegisterError("");
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: "EMPLOYER",
        }),
      });
      const regData = await regRes.json().catch(() => ({}));
      const userId = regData.userId;
      if (!userId) {
        setRegisterError(regData.error || "Registration failed");
        return;
      }
      await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: companyName.trim(),
          companyId: companyId.trim() || "N/A",
          contactEmail: email.trim().toLowerCase(),
          contactPhone: phone.trim(),
        }),
      });
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          role: "EMPLOYER",
        }),
      });
      if (!loginRes.ok) {
        setRegisterError("Account created. Please sign in on the login page.");
        router.push("/login");
        return;
      }
      const loginData = await loginRes.json().catch(() => ({}));
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("employerHasSubscription");
        window.sessionStorage.setItem("matcher_employer_user_id", loginData.userId || userId);
        window.sessionStorage.setItem("employerLoggedIn", "1");
        const companyRes = await fetch(`/api/companies?userId=${encodeURIComponent(loginData.userId || userId)}`);
        const companyData = await companyRes.json().catch(() => null);
        if (companyData?.id) window.sessionStorage.setItem("matcher_employer_company_id", companyData.id);
      }
      router.push("/employer/cabinet");
    } catch {
      setRegisterError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo height={80} />
          <Link
            href="/employer"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {tCommon("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t("subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-900">{t("companyName")}</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("companyNamePlaceholder")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  companyName.length > 0 && companyName.trim().length < 2
                    ? "border-red-300"
                    : "border-gray-200"
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
                  companyId.length > 0 && companyId.trim().length < 2
                    ? "border-red-300"
                    : "border-gray-200"
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("contactEmailPlaceholder")}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  email.length > 0 && !isValidEmail(email) ? "border-red-300" : "border-gray-200"
                }`}
              />
              {email.length > 0 && !isValidEmail(email) && (
                <p className="mt-2 text-xs text-red-600">{t("validEmail")}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">{t("contactPhone")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+995 5xx xx xx xx"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30 ${
                  phone.length > 0 && !isValidPhone(phone) ? "border-red-300" : "border-gray-200"
                }`}
              />
              {phone.length > 0 && !isValidPhone(phone) && (
                <p className="mt-2 text-xs text-red-600">{t("validPhone")}</p>
              )}
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

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fakeSendOtp("phone")}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("verifySms")}
              </button>
              <button
                type="button"
                onClick={() => fakeSendOtp("email")}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t("verifyEmail")}
              </button>
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
            {t("alreadyRegistered")}{" "}
            <Link href="/login" className="font-medium text-matcher-dark hover:text-matcher">
              {t("logIn")}
            </Link>
          </p>
        </div>
      </main>

      {otpOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {otpSentTo === "phone" ? t("verifyPhone") : t("verifyEmailTitle")}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {t("enterCodeSent", { target: otpSentTo === "phone" ? t("phone") : t("email") })}
                </p>
              </div>
              <button
                onClick={() => setOtpOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium text-gray-900">{t("verificationCode")}</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("codePlaceholder")}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-matcher/30"
              />
              <p className="mt-2 text-xs text-gray-500">{t("mvpHint")}</p>
              {registerError && (
                <p className="mt-2 text-sm text-red-600">{registerError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setOtp("")}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {t("resendCode")}
              </button>
              <button
                onClick={fakeVerifyOtp}
                className="rounded-2xl bg-matcher px-5 py-3 text-sm font-semibold text-white hover:bg-matcher-dark"
              >
                {t("verify")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
