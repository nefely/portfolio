"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthState = "unknown" | "guest" | "signedIn";

// Клієнтський компонент навмисно: якби Header читав сесію з cookies на
// сервері, усі публічні сторінки стали б динамічними (зараз вони статичні
// через generateStaticParams + setRequestLocale у layout).
//
// getSession() читає сесію з cookie локально, без запиту до Supabase — для
// вибору "Увійти"/"Кабінет" цього достатньо (доступ до кабінету все одно
// перевіряє сервер). Перечитуємо на кожну навігацію, бо вхід/вихід
// відбувається в server actions — onAuthStateChange у браузері їх не бачить.
export function AuthNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>("unknown");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setState(data.session ? "signedIn" : "guest");
      if (!data.session) return;

      // Непрочитані вхідні з усіх розмов — RLS віддає лише власні розмови.
      // head: true — лише count, без самих рядків.
      const { count } = await supabase
        .from("job_platform_messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", data.session.user.id);
      if (!cancelled) setUnread(count ?? 0);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "signedIn" : "guest");
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  const className =
    "inline-flex h-10.5 items-center rounded-full border border-gray-300 px-4 text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900";

  // Той самий вигляд, що й ThemeToggle — квадратна кнопка з іконкою.
  const iconButtonClassName =
    "relative flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900";

  // Плейсхолдер тієї ж ширини, поки не знаємо стан, — шапка не стрибає.
  if (state === "unknown") {
    return <span aria-hidden="true" className="inline-block h-10.5 w-24" />;
  }

  return state === "signedIn" ? (
    <div className="flex items-center gap-3">
      <Link
        href="/account/messages"
        aria-label={
          unread > 0 ? `${t("messages")} (${t("unreadMessages")}: ${unread})` : t("messages")
        }
        title={t("messages")}
        className={iconButtonClassName}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] leading-none font-semibold text-white ring-2 ring-white dark:bg-white dark:text-gray-900 dark:ring-gray-950"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
      <Link
        href="/account"
        aria-label={t("account")}
        title={t("account")}
        className={iconButtonClassName}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4.5 w-4.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </Link>
    </div>
  ) : (
    <Link href="/login" className={className}>
      {t("login")}
    </Link>
  );
}
