/**
 * About page sections config.
 * To add a section: add an entry here, then add translations under
 * about.sections.{key}.title and about.sections.{key}.text in en.json and ka.json
 */
export const aboutSections = [
  { key: "time", icon: "⏱", accent: "border-l-matcher bg-matcher-mint/40" },
  { key: "simplicity", icon: "✨", accent: "border-l-matcher-teal bg-matcher-teal/10" },
  { key: "global", icon: "🌍", accent: "border-l-matcher-amber bg-matcher-amber/10" },
  { key: "life", icon: "📱", accent: "border-l-matcher bg-matcher-mint/30" },
  { key: "mission", icon: "🎯", accent: "border-l-matcher-coral bg-matcher-coral/10" },
  { key: "future", icon: "🚀", accent: "border-l-matcher-teal bg-matcher-teal/15" },
] as const;
