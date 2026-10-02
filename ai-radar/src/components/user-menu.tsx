"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAuth } from "./auth-provider";

export function UserMenu({ showEmail = false }: { showEmail?: boolean }) {
  const t = useTranslations("header");
  const { user, status, signOut } = useAuth();
  const pathname = usePathname();

  if (status === "loading") {
    return <span className="h-8 w-20 shrink-0 animate-pulse rounded-md bg-surface-2" aria-hidden="true" />;
  }

  if (!user) {
    const href = pathname === "/login" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
    return (
      <Link
        href={href}
        className="shrink-0 whitespace-nowrap rounded-md border border-accent-border bg-accent-subtle px-3 py-1.5 text-sm font-medium text-accent-text hover:bg-accent/20"
      >
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div className={`flex min-w-0 items-center gap-2 ${showEmail ? "w-full" : ""}`}>
      <span
        title={`${t("signedInAs")} ${user.email}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-subtle font-display text-sm font-semibold text-accent-text"
      >
        {(user.email ?? "?")[0].toUpperCase()}
      </span>
      {showEmail && <span className="min-w-0 flex-1 truncate text-sm text-fg-muted">{user.email}</span>}
      <button
        type="button"
        onClick={() => void signOut()}
        aria-label={t("signOut")}
        title={t("signOut")}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line text-fg-muted transition-colors hover:border-danger/40 hover:text-danger"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </div>
  );
}
