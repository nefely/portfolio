"use client";

import { useActionState } from "react";
import { loginAsDemo } from "@/lib/auth/actions";

const initialState = {};

export default function DemoLoginButton() {
  const [state, formAction, pending] = useActionState(loginAsDemo, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="group flex w-full items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
          👋
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">
            {pending ? "Signing in…" : "Try the demo account"}
          </span>
          <span className="block truncate text-xs text-slate-500">
            One click, no sign-up — a board with sample tasks.
          </span>
        </span>
        <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
          →
        </span>
      </button>

      <p className="text-center text-xs text-slate-400">
        Or sign in manually: <span className="font-mono">demo@taskmanager.app</span> /{" "}
        <span className="font-mono">DemoBoard2026!</span>
      </p>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
