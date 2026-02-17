"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import { MOCK_EMPLOYER_SUBSCRIPTION } from "@/lib/matchMockData";
import { performEmployerLogout } from "@/lib/logoutUtils";

export default function EmployerCabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState(false);

  function handleLogout() {
    performEmployerLogout();
    router.push("/login");
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("employerLoggedIn", "1");
      setHasSubscription(!!window.sessionStorage.getItem("employerHasSubscription"));
    }
  }, []);

  const sub = hasSubscription ? MOCK_EMPLOYER_SUBSCRIPTION : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <div className="mb-8 flex items-center justify-center rounded-xl border border-matcher/20 bg-matcher-pale/50 px-4 py-5">
            <Logo height={72} />
          </div>

          {sub ? (
            <div className="mb-6 rounded-xl border border-matcher/30 bg-matcher-pale p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-matcher-dark">
                Subscription
              </p>
              <p className="mt-1 font-semibold text-gray-900">{sub.packageLabel}</p>
              <p className="mt-1 text-xs text-gray-600">
                {sub.vacanciesTotal === -1
                  ? `${sub.vacanciesUsed} used · Unlimited`
                  : `${sub.vacanciesUsed} / ${sub.vacanciesTotal} vacancies used`}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Valid until {new Date(sub.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <p className="mt-1 text-xs text-matcher-dark">{sub.pricePaid} GEL / year</p>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subscription
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">No subscription yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Post a vacancy and choose a package to get started.
              </p>
              <Link
                href="/employer/post?from=cabinet"
                className="mt-3 block rounded-lg bg-matcher px-3 py-2 text-center text-sm font-medium text-white hover:bg-matcher-dark"
              >
                Post vacancy
              </Link>
            </div>
          )}

          <nav className="flex flex-col gap-1">
            <Link
              href="/employer/cabinet"
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname?.endsWith("/employer/cabinet") && !pathname?.includes("/chats")
                  ? "bg-matcher-mint text-matcher-dark"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Candidates
            </Link>
            <Link
              href="/employer/cabinet/chats"
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname?.includes("/chats")
                  ? "bg-matcher-mint text-matcher-dark"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tCommon("chats")}
            </Link>
            <Link
              href="/employer/post?from=cabinet"
              className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Post vacancy
            </Link>
            <Link
              href="/employer/cabinet/profile"
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === "/employer/cabinet/profile"
                  ? "bg-matcher-mint text-matcher-dark"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Company profile
            </Link>
          </nav>

          <div className="mt-auto border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              {tCommon("logOut")}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
