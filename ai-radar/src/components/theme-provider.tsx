"use client";

import { useServerInsertedHTML } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

// Ported from portfolio/job-platform/components/theme/ThemeProvider.tsx, simplified
// to light/dark with dark as the default (the brand look). An inline script sets
// the class before first paint, so there is no flash of the wrong theme.

export type Theme = "light" | "dark";
const STORAGE_KEY = "ai-radar:theme";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")==="light"?"light":"dark";var c=document.documentElement.classList;c.toggle("dark",t==="dark");c.toggle("light",t==="light");document.documentElement.style.colorScheme=t;}catch(e){}})();`;

const listeners = new Set<() => void>();
let cached: Theme | null = null;

function getSnapshot(): Theme {
  if (cached === null) {
    try {
      cached = window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      cached = "dark";
    }
  }
  return cached;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(next: Theme) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable — theme stays in memory for this session
  }
  listeners.forEach((l) => l());
}

type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />);

  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);

  useEffect(() => {
    const c = document.documentElement.classList;
    c.toggle("dark", theme === "dark");
    c.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => write(t), []);
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
