import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/lib/auth/ensureProfile";
import { isAccountRole } from "@/lib/auth/roles";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/server";

// Сюди повертають і лист підтвердження email, і Google OAuth. Підтримує обидва
// формати Supabase — token_hash (поточні шаблони листів) і PKCE `code` (OAuth,
// старі шаблони) — як portfolio/task-manager/src/app/auth/confirm/route.js.
// ?role= приходить з форми реєстрації: фіксуємо роль, щойно з'явилась сесія.
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/[locale]/auth/callback">,
) {
  const { locale } = await params;
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const role = searchParams.get("role");
  const next = safeNextPath(searchParams.get("next"), `/${locale}/account`);

  const supabase = await createClient();

  let userId: string | undefined;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) userId = data.user?.id;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) userId = data.user?.id;
  }

  if (!userId) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=callbackFailed`);
  }

  if (isAccountRole(role)) {
    await ensureProfile(supabase, userId, role);
  }

  // Без ролі (вхід через Google без реєстрації, акаунт із task-manager)
  // /account сам відправить на /account/role — див. requireProfile().
  return NextResponse.redirect(`${origin}${next}`);
}
