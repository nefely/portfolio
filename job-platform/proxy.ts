import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/proxy";

// Next.js 16 renamed the `middleware` file convention to `proxy`
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIX = "/account";
const GUEST_ONLY_PATHS = ["/login", "/signup"];

function splitLocale(pathname: string): { locale: string; path: string } | null {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (!(routing.locales as readonly string[]).includes(maybeLocale)) return null;
  return { locale: maybeLocale, path: `/${rest.join("/")}` };
}

// Оптимістичні перевірки (лише редіректи для зручності). Справжній захист —
// requireProfile() у lib/auth/dal.ts і RLS у Supabase.
export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // next-intl вирішив редіректнути (напр. "/" → "/en") — наступний запит
  // уже з локаллю пройде сюди ще раз, тоді й перевіримо сесію.
  if (response.headers.has("location")) {
    return response;
  }

  // Без auth-cookie сесії немає — не робимо мережевий запит до Supabase на
  // кожен перегляд публічної сторінки гостем.
  const hasAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  const user = hasAuthCookie ? await updateSession(request, response) : null;

  const parsed = splitLocale(request.nextUrl.pathname);
  if (!parsed) return response;
  const { locale, path } = parsed;

  const isProtected = path === PROTECTED_PREFIX || path.startsWith(`${PROTECTED_PREFIX}/`);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return withCookies(NextResponse.redirect(url), response);
  }

  if (user && GUEST_ONLY_PATHS.includes(path)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${PROTECTED_PREFIX}`;
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

// Оновлені auth-cookies лежать у відповіді next-intl — переносимо їх у
// редірект, щоб оновлена сесія не загубилась.
function withCookies(redirect: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/", "/(uk|en|pl)/:path*", "/((?!_next|.*\\..*).*)"],
};
