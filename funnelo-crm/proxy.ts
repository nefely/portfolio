import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

// Next.js 16 перейменував `middleware` на `proxy`
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
//
// CRM — закритий застосунок: усе, крім входу, потребує сесії. Тут лише
// оптимістичні редіректи для зручності; справжній захист — requireProfile()
// у lib/auth/dal.ts і RLS у Supabase.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = pathname === "/login";

  // Без auth-cookie сесії немає — не робимо мережевий запит до Supabase.
  const hasAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasAuthCookie) {
    return isPublic ? NextResponse.next() : redirectToLogin(request);
  }

  const { user, response } = await updateSession(request);

  if (!user && !isPublic) {
    return withCookies(redirectToLogin(request), response);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return withCookies(NextResponse.redirect(url), response);
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  const { pathname } = request.nextUrl;
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

// Оновлені auth-cookies переносимо в редірект, щоб сесія не загубилась.
function withCookies(redirect: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
