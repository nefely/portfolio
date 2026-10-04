import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/lib/auth/ensureProfile";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/server";

// Сюди повертають і лист підтвердження email, і Google OAuth. Підтримує обидва
// формати Supabase: token_hash (шаблони листів) і PKCE `code` (OAuth).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"), "/library");

  const supabase = await createClient();

  let user = null;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) user = data.user;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) user = data.user;
  }

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=callback`);
  }

  await ensureProfile(supabase, user);
  return NextResponse.redirect(`${origin}${next}`);
}
