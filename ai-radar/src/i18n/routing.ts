import { defineRouting } from "next-intl/routing";

// Same paths for every locale (/uk/catalog, /en/catalog) — like job-platform.
export const routing = defineRouting({
  locales: ["uk", "en"],
  defaultLocale: "uk",
});

export type AppLocale = (typeof routing.locales)[number];
