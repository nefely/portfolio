import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the link from Supabase's confirmation email. Supports both the
// token_hash flow (current default templates) and the PKCE `code` flow, so
// it works regardless of how the project's email templates are configured.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/board";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const message = encodeURIComponent(
    "Couldn't confirm your email. Please try logging in or signing up again."
  );
  return NextResponse.redirect(`${origin}/login?error=${message}`);
}
