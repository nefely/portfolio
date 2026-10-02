"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

const NAV = [
  { href: "/catalog", key: "catalog" },
  { href: "/niches", key: "niches" },
  { href: "/favorites", key: "favorites" },
  { href: "/compare", key: "compare" },
  { href: "/about", key: "about" },
] as const;

export function Header() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  // the menu belongs to the page it was opened on → closes itself on navigation
  const open = openedAt === pathname;
  const close = () => setOpenedAt(null);

  // close on Escape; lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedAt(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="glass sticky top-0 z-40 border-b border-line">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-[15px] font-semibold tracking-tight">
          <RadarIcon />
          <span>
            AI <span className="text-accent">Radar</span>
          </span>
        </Link>

        {/* desktop */}
        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 transition-colors ${
                isActive(item.href) ? "bg-accent-subtle text-accent-text" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <LocaleSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>

        {/* mobile */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpenedAt(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("closeMenu") : t("menu")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-fg hover:bg-surface-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden">
          <button type="button" aria-label={t("closeMenu")} onClick={close} className="fixed inset-x-0 bottom-0 top-14 bg-black/40" />
          <div className="absolute inset-x-0 top-14 border-b border-line bg-page px-4 pb-5 pt-3 shadow-2xl shadow-black/30">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`rounded-lg px-3 py-3 text-base transition-colors ${
                    isActive(item.href) ? "bg-accent-subtle text-accent-text" : "text-fg hover:bg-surface-2"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-line pt-4">
              <UserMenu showEmail />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function RadarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeOpacity=".35" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" stroke="var(--accent)" strokeOpacity=".6" strokeWidth="1.5" />
      <path d="M12 12 19 5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.8" fill="var(--accent)" />
      <circle cx="16.5" cy="8.5" r="1.3" fill="var(--amber)" />
    </svg>
  );
}
