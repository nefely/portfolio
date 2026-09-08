import { defineRouting } from "next-intl/routing";

export const locales = ["en", "de", "es", "it", "fr", "uk"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
	en: "English",
	de: "Deutsch",
	es: "Español",
	it: "Italiano",
	fr: "Français",
	uk: "Українська",
};

export const routing = defineRouting({
	locales,
	defaultLocale,
	localePrefix: "always",
});
