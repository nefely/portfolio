import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// 404 for URLs that match no route at all (e.g. /something.html, /api/unknown).
// Localized 404s inside /uk and /en are handled by [locale]/not-found.tsx.
// This page bypasses the [locale] layout, so the locale is unknown — show both
// languages — and the theme is applied by the same inline script as ThemeProvider.

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "cyrillic"], weight: ["600"] });

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("ai-radar:theme")==="light"?"light":"dark";var c=document.documentElement.classList;c.remove("dark","light");c.add(t);}catch(e){}})();`;

export const metadata: Metadata = {
  title: "404 · AI Radar",
};

export default function GlobalNotFound() {
  return (
    <html lang="uk" className={`dark ${inter.variable} ${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col items-center justify-center px-4 text-center">
        <div className="bg-dot-grid pointer-events-none fixed inset-0 mask-[radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <main className="relative flex max-w-md flex-col items-center">
          <p className="font-mono text-sm text-accent-text">404</p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">Сторінку не знайдено</h1>
          <p className="mt-1 text-fg-muted">Page not found</p>
          <p className="mt-4 text-sm text-fg-subtle">
            Такої адреси немає — можливо, посилання застаріло.
            <br />
            This address doesn&apos;t exist — the link may be outdated.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link href="/uk" className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-medium text-on-accent hover:bg-accent-hover">
              На головну
            </Link>
            <Link href="/en" className="inline-flex h-10 items-center rounded-lg border border-line px-5 text-sm font-medium text-fg hover:bg-surface-2">
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
