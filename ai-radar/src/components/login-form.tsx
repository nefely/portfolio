"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type ErrorKey = "email" | "password" | "invalid" | "notConfirmed" | "exists" | "rateLimit" | "callback" | "unknown";

const fieldCls =
  "h-11 w-full rounded-lg border border-line bg-input px-3 text-[15px] text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent focus:ring-3 focus:ring-accent/20";

function mapError(message: string): ErrorKey {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "invalid";
  if (m.includes("email not confirmed")) return "notConfirmed";
  if (m.includes("already registered")) return "exists";
  if (m.includes("password")) return "password";
  if (m.includes("rate limit")) return "rateLimit";
  return "unknown";
}

/** `next` is a locale-less path (e.g. "/favorites"); the i18n router adds the locale. */
export function LoginForm({ next, initialError }: { next: string; initialError?: ErrorKey }) {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(initialError ?? null);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);

  function done() {
    router.replace(next);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("email");
    if (password.length < 6) return setError("password");

    setPending(true);
    const supabase = createClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(mapError(error.message));
        done();
      } else {
        // the callback route lives outside [locale], so give it a full localized path back
        const back = encodeURIComponent(`/${locale}${next}`);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${back}` },
        });
        if (error) return setError(mapError(error.message));
        // "Confirm email" disabled in Supabase → the session exists right away
        if (data.session) done();
        else setCheckEmail(email);
      }
    } catch {
      setError("unknown");
    } finally {
      setPending(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="rounded-xl border border-accent-border bg-accent-subtle p-5 text-sm">
        <p className="font-display text-base font-semibold text-accent-text">{t("checkEmailTitle")}</p>
        <p className="mt-1 text-fg-muted">{t("checkEmailText", { email: checkEmail })}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 rounded-lg border border-line bg-surface-2 p-1 text-sm" role="tablist">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`h-9 rounded-md transition-colors ${mode === m ? "bg-surface-1 text-fg shadow-sm" : "text-fg-muted hover:text-fg"}`}
          >
            {m === "signin" ? t("signIn") : t("signUp")}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">{t("email")}</span>
          <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={fieldCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">{t("password")}</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            placeholder={t("passwordPlaceholder")}
            className={fieldCls}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {t(`errors.${error}`)}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 h-11 rounded-lg bg-accent font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? t("pending") : mode === "signin" ? t("submitSignIn") : t("submitSignUp")}
        </button>
      </form>
    </div>
  );
}
