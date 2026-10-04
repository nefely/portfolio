"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { ensureMyProfile } from "@/lib/auth/actions";
import { GOOGLE_AUTH_ENABLED } from "@/lib/auth/features";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { describeAuthError, validateAuthForm, type AuthFormErrors } from "@/lib/validation/auth";
import { queryKeys } from "@/lib/query/keys";

type Mode = "login" | "signup";

const COPY: Record<
  Mode,
  {
    title: string;
    subtitle: string;
    submit: string;
    switchText: string;
    switchLink: string;
    switchHref: string;
  }
> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to pick up where you left off.",
    submit: "Sign in",
    switchText: "New to GeekHub?",
    switchLink: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Join GeekHub",
    subtitle: "Track what you watch, build lists and review anime.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: "Sign in",
    switchHref: "/login",
  },
};

// Вхід через браузерний клієнт Supabase (а не Server Action): так спрацьовує
// onAuthStateChange і AuthListener миттєво оновлює хедер і кеш.
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const next = safeNextPath(searchParams.get("next"), "/library");
  const callbackError = searchParams.get("error") === "callback";

  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [formError, setFormError] = useState<string | null>(
    callbackError ? "That link is invalid or has expired." : null,
  );
  const [pending, setPending] = useState(false);
  const [checkEmailFor, setCheckEmailFor] = useState<string | null>(null);
  const copy = COPY[mode];

  // window доступний лише в обробниках — компонент також рендериться на сервері.
  const callbackUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const validation = validateAuthForm({ email, password }, mode);
    setErrors(validation);
    setFormError(null);
    if (validation.email || validation.password) return;

    setPending(true);
    const supabase = createClient();
    const { data, error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: callbackUrl() },
          });

    if (error) {
      setFormError(describeAuthError(error));
      setPending(false);
      return;
    }

    // Supabase чекає підтвердження email — сесії ще немає.
    if (!data.session) {
      setCheckEmailFor(email);
      setPending(false);
      return;
    }

    await ensureMyProfile();
    await queryClient.invalidateQueries({ queryKey: queryKeys.sessionUser });
    router.replace(next);
    router.refresh();
  }

  async function handleGoogle() {
    setPending(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) {
      setFormError(describeAuthError(error));
      setPending(false);
    }
  }

  if (checkEmailFor) {
    return (
      <div className="space-y-3 text-center">
        <MailCheck className="mx-auto size-10 text-primary" />
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{checkEmailFor}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          error={errors.password}
        />
        {formError && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Please wait…" : copy.submit}
        </Button>
      </form>

      {GOOGLE_AUTH_ENABLED && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={handleGoogle}
            disabled={pending}
          >
            Continue with Google
          </Button>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {copy.switchText}{" "}
        <Link
          href={`${copy.switchHref}${next !== "/library" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-medium text-primary hover:underline"
        >
          {copy.switchLink}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  ...props
}: { label: string; error?: string } & React.ComponentProps<typeof Input> & { name: string }) {
  const id = `field-${props.name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="h-10"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
