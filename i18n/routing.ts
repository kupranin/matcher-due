import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ka"],
  defaultLocale: "en",
  localePrefix: "always", // /en, /ka — avoids redirect loops with "as-needed"
});
