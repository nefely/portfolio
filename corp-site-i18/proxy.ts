import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
	return handleI18nRouting(request);
}

export const config = {
	// Match all pathnames except for static assets, Next.js internals and API routes.
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
