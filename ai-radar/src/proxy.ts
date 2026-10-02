import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed `middleware` → `proxy`. Only locale routing happens here;
// auth state is handled on the client (see components/auth-provider.tsx).
export default createMiddleware(routing);

export const config = {
  matcher: [
    // everything except API, auth callback, Next internals and static files (paths with a dot)…
    "/((?!api|auth|_next|_vercel|.*\\..*).*)",
    // …but localized pages may contain dots too: /en/site/bolt.new, /uk/compare?d=a.com.
    // Without this, soft navigations to them render in the default locale.
    "/(uk|en)/:path*",
  ],
};
