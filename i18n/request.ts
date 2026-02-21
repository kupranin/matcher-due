import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested!
    : routing.defaultLocale;
  // "local" uses English messages (no messages/local.json)
  const messagesLocale = locale === "local" ? "en" : locale;
  return {
    locale,
    messages: (await import(`../messages/${messagesLocale}.json`)).default,
  };
});
