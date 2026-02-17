"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { performCandidateLogout } from "@/lib/logoutUtils";

export default function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    performCandidateLogout();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <div className="mb-8 flex items-center justify-center rounded-xl border border-matcher/20 bg-matcher-pale/50 px-4 py-5">
            <Logo height={72} />
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              href="/cabinet"
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === "/cabinet"
                  ? "bg-matcher-mint text-matcher-dark"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tCommon("matches")}
            </Link>
            <Link
              href="/cabinet/chats"
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname?.includes("/chats")
                  ? "bg-matcher-mint text-matcher-dark"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tCommon("chats")}
            </Link>
            <Link
              href="/cabinet/profile"
              className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                pathname === "/cabinet/profile"
                  ? "bg-matcher-mint text-matcher-dark"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tCommon("profile")}
            </Link>
          </nav>

          <div className="mt-auto border-t border-gray-100 pt-4">
            <div className="mb-2 flex justify-center">
              <LanguageSwitcher />
            </div>
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
