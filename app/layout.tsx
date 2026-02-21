import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matcher.ge — Job matching for Georgia",
  description: "Get matched to your first job in minutes. No CV required.",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "78x112" }, { url: "/icon.png", type: "image/png", sizes: "any" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") ?? "en";

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="78x112" />
      </head>
      <body>{children}</body>
    </html>
  );
}
