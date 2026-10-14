import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Sign in" };

const HIGHLIGHTS = [
  "Drag-and-drop pipeline with live updates",
  "Companies, contacts and a full activity timeline",
  "Dashboard with forecast, win rate and leaderboard",
  "Admin and user roles enforced by row-level security",
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {/* LoginForm читає ?next= через useSearchParams — без Suspense вся
              сторінка стала б клієнтським рендером. */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,oklch(1_0_0/0.18),transparent),radial-gradient(50%_50%_at_10%_90%,oklch(0_0_0/0.25),transparent)]"
        />
        <div className="relative flex h-full flex-col justify-center gap-8 px-16 text-primary-foreground">
          <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
            Every deal, from first call to closed-won.
          </h2>
          <ul className="space-y-3 text-primary-foreground/85">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary-foreground/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
