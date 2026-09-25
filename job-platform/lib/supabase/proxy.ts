import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

// Порт portfolio/task-manager/src/lib/supabase/proxy.js на TS, з однією
// різницею: тут відповідь уже створив next-intl (редірект на локаль /
// rewrite), тож оновлені auth-cookies дописуємо в НЕЇ, а не в новий
// NextResponse.next() — інакше загубились би або cookies, або локаль.
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() (а не getSession()) перевіряє токен у самого Supabase і за
  // потреби оновлює його — саме тут протухлий access token міняється на новий.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
