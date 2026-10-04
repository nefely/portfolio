import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

// Next.js 16 перейменував `middleware` на `proxy`
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).

// /lists/[id] сюди навмисно не входить: публічні списки відкриваються гостям,
// а приватні ховає RLS.
const PROTECTED_PATHS = ["/library", "/lists", "/settings"];
const GUEST_ONLY_PATHS = ["/login", "/signup"];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || (path !== "/lists" && pathname.startsWith(`${path}/`)),
  );
}

// Оптимістичні редіректи для зручності. Справжній захист — requireUser()
// у lib/auth/dal.ts і RLS у Supabase.
export default async function proxy(request: NextRequest) {
  // Без auth-cookie сесії немає — не робимо мережевий запит до Supabase на
  // кожен перегляд публічної сторінки гостем.
  const hasAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  const { pathname } = request.nextUrl;

  if (!hasAuthCookie) {
    if (isProtected(pathname)) return redirectToLogin(request);
    return NextResponse.next();
  }

  const { user, response } = await updateSession(request);

  if (!user && isProtected(pathname)) {
    return withCookies(redirectToLogin(request), response);
  }

  if (user && GUEST_ONLY_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/library";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

// Оновлені auth-cookies переносимо в редірект, щоб сесія не загубилась.
function withCookies(redirect: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  // Статику, картинки й API каталогу (публічний, кешований) пропускаємо.
  matcher: [
    "/((?!_next/static|_next/image|api/anime|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
