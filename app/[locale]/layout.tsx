import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Geist, Geist_Mono, Noto_Sans_Georgian, Manrope } from "next/font/google";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansGeorgian = Noto_Sans_Georgian({
  variable: "--font-georgian",
  subsets: ["georgian"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const displayLocale = locale === "local" ? "en" : locale;

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <div
          className={`${geistSans.variable} ${geistMono.variable} ${notoSansGeorgian.variable} ${manrope.variable} antialiased ${
            displayLocale === "ka" ? "[font-family:var(--font-georgian),var(--font-geist-sans),system-ui,sans-serif]" : ""
          }`}
          lang={displayLocale}
          data-locale={locale}
        >
          {/* Global controls (desktop only). Mobile pages can render controls in their headers. */}
          <div className="hidden md:fixed md:right-6 md:bottom-6 md:z-[100] md:flex md:flex-col md:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {children}
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
