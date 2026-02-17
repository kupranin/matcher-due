"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const memberKeys = ["nino", "ketevan", "david"] as const;
const initials = { nino: "N", ketevan: "K", david: "D" } as const;

export default function TeamPage() {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const values = t.raw("values") as string[];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Soft background gradient */}
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
              {tCommon("backToHome")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-xl text-gray-600 sm:text-2xl">
            {t("subtitle")}
          </p>
          <p className="mt-8 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("intro")}
          </p>
        </section>

        {/* Section 1: Why we started */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("whyHeading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("whyText")}
          </p>
        </section>

        {/* Section 2: Globally local */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("globalHeading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("globalText")}
          </p>
          <p className="mt-6 rounded-xl border-l-4 border-matcher bg-matcher-pale/60 px-5 py-4 text-sm font-medium italic text-gray-700 sm:text-base">
            {t("globalHighlight")}
          </p>
        </section>

        {/* Section 3: What we believe */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("beliefsHeading")}
          </h2>
          <ul className="mt-6 space-y-4">
            {Array.isArray(values) && values.map((value, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-matcher" aria-hidden />
                <span className="text-base leading-relaxed text-gray-600 sm:text-lg">{value}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Founding Team */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("foundingHeading")}
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {memberKeys.map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-matcher/15 text-xl font-bold text-matcher-dark"
                  aria-hidden
                >
                  {initials[key]}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{t(`members.${key}.name`)}</h3>
                <p className="mt-1 text-sm font-medium text-matcher-dark">{t(`members.${key}.role`)}</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">{t(`members.${key}.text`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing section */}
        <section className="mt-20 sm:mt-24">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {t("closingHeading")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            {t("closingText")}
          </p>
          <p className="mt-10 text-center text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            {t("closingLine")}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
