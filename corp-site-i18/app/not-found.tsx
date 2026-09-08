// Root-level fallback for requests that fall outside the `[locale]` segment
// (the proxy matcher excludes a few paths). Redirects to the default
// locale's own not-found experience.
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootNotFound() {
	redirect(`/${routing.defaultLocale}`);
}
