"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function EmployerPage() {
  const t = useTranslations("employer");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo height={80} />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-gray-600">
          {t("subtitle")}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/employer/register"
            className="group rounded-3xl border-2 border-matcher bg-matcher-pale/50 p-6 text-left transition hover:border-matcher hover:bg-matcher-mint"
          >
            <div className="text-lg font-semibold text-gray-900 group-hover:text-matcher-dark">
              {t("registerCompany")}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {t("registerDesc")}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-matcher-dark">
              {t("registerCta")}
            </span>
          </Link>

          <Link
            href="/employer/post"
            className="group rounded-3xl border-2 border-gray-200 bg-gray-50/50 p-6 text-left transition hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="text-lg font-semibold text-gray-900 group-hover:text-gray-800">
              {t("postVacancy")}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {t("postVacancyDesc")}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-gray-700">
              {t("postCta")}
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {t("alreadyHave")}{" "}
          <Link href="/login" className="font-medium text-matcher-dark hover:text-matcher">
            {tCommon("logIn")}
          </Link>
          {" · "}
          <Link href="/employer/cabinet" className="font-medium text-matcher-dark hover:text-matcher">
            {t("employerCabinet")}
          </Link>
        </p>
      </main>
    </div>
  );
}
