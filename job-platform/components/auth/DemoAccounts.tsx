"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { cardHoverClassName } from "@/components/shared/cardStyles";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/auth/demo";
import type { AccountRole } from "@/types/account";

interface DemoAccountsProps {
  action: (formData: FormData) => void;
  next?: string;
  disabled: boolean;
}

// Окрема форма з тією ж server action, що й звичайний вхід: email приходить
// як name/value натиснутої кнопки, пароль — прихованим полем. Без JS теж працює.
export function DemoAccounts({ action, next, disabled }: DemoAccountsProps) {
  const t = useTranslations("auth");

  return (
    <form action={action} className="flex flex-col gap-2">
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="password" value={DEMO_PASSWORD} />

      {DEMO_ACCOUNTS.map((account) => (
        <DemoAccountButton key={account.email} {...account} disabled={disabled} />
      ))}

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        {t("demoPasswordHint")} <span className="font-mono">{DEMO_PASSWORD}</span>
      </p>
    </form>
  );
}

function DemoAccountButton({
  role,
  email,
  disabled,
}: {
  role: AccountRole;
  email: string;
  disabled: boolean;
}) {
  const t = useTranslations("auth");
  const { pending, data } = useFormStatus();
  const isPending = pending && data?.get("email") === email;

  const copy: Record<AccountRole, { title: string; text: string }> = {
    employer: { title: t("demoEmployerTitle"), text: t("demoEmployerText") },
    seeker: { title: t("demoSeekerTitle"), text: t("demoSeekerText") },
  };

  return (
    <button
      type="submit"
      name="email"
      value={email}
      disabled={disabled}
      className={`group flex w-full min-w-0 items-center gap-3 rounded-xl border border-gray-200 p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none disabled:opacity-60 dark:border-gray-800 ${cardHoverClassName}`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400">
        {role === "employer" ? <BriefcaseIcon /> : <UserIcon />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {copy[role].title}
          <span className="rounded-full bg-gray-100 px-1.5 py-px text-[11px] font-medium text-gray-500 uppercase dark:bg-gray-800 dark:text-gray-400">
            {t("demoBadge")}
          </span>
        </span>
        <span className="block truncate text-xs text-gray-600 dark:text-gray-300">
          {isPending ? t("loginSubmitting") : copy[role].text}
        </span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-gray-400 transition-[color,translate] group-hover:translate-x-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-4.5",
} as const;

function BriefcaseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}
