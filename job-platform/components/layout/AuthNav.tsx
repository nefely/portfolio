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

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setState(data.session ? "signedIn" : "guest");
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

  // Плейсхолдер тієї ж ширини, поки не знаємо стан, — шапка не стрибає.
  if (state === "unknown") {
    return <span aria-hidden="true" className="inline-block h-10.5 w-24" />;
  }

  return state === "signedIn" ? (
    <Link href="/account" className={className}>
      {t("account")}
    </Link>
  ) : (
    <Link href="/login" className={className}>
      {t("login")}
    </Link>
  );
}
