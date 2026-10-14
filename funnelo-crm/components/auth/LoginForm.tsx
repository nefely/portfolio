"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/auth/demo";
import { safeNextPath } from "@/lib/auth/safeNextPath";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Вхід через браузерний клієнт Supabase (а не Server Action): так спрацьовує
// onAuthStateChange, і сесія одразу є і в cookies, і в клієнті для realtime.
export function LoginForm() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"), "/dashboard");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function signIn(email: string, password: string, source: string) {
    setPending(source);
    setError(null);
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Wrong email or password."
          : authError.message,
      );
      setPending(null);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    signIn(email, password, "form");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Funnelo</h1>
        <p className="text-sm text-muted-foreground">
          Pick a demo role to look around, or use your own account.
        </p>
      </div>

      <div className="grid gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={pending !== null}
            onClick={() => signIn(account.email, DEMO_PASSWORD, account.role)}
            className="group flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/50 disabled:opacity-60"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              {account.role === "admin" ? (
                <ShieldCheck className="size-4.5" />
              ) : (
                <UserRound className="size-4.5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                {account.name}
                <span className="rounded-full bg-muted px-1.5 py-px text-[11px] font-medium text-muted-foreground uppercase">
                  {account.role}
                </span>
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {account.description}
              </span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
        <p className="text-center text-xs text-muted-foreground">
          Password for both: <span className="font-mono">{DEMO_PASSWORD}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="h-9"
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button type="submit" className="h-9 w-full" disabled={pending !== null}>
          {pending === "form" ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
