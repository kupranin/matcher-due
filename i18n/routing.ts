import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ka", "local"],
  defaultLocale: "en",
  localePrefix: "always", // /en, /ka, /local — "local" uses English (for local dev)
});
