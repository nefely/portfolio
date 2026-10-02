import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed `middleware` → `proxy`. Only locale routing happens here;
// auth state is handled on the client (see components/auth-provider.tsx).
export default createMiddleware(routing);

export const config = {
  // skip API, auth callback, Next internals and static files
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
