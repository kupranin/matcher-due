import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansGeorgian.variable} antialiased ${
          locale === "ka" ? "[font-family:var(--font-georgian),var(--font-geist-sans),system-ui,sans-serif]" : ""
        }`}
        lang={locale}
        data-locale={locale}
      >
        {/* Global language switcher - bottom-right, high z-index so it stays visible */}
        <div className="fixed right-4 bottom-4 z-[100] md:right-6 md:bottom-6">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
