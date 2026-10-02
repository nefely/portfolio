import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";
import { CompareBar } from "@/components/compare-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MotionProvider } from "@/components/motion";
import { ThemeProvider } from "@/components/theme-provider";
import { type AppLocale, routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
// Montserrat instead of itlead's Poppins: same geometric feel, but with Cyrillic glyphs
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin", "cyrillic"], weight: ["500", "600", "700"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export async function generateMetadata(props: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "meta" });
  return {
    title: { default: t("title"), template: "%s · AI Radar" },
    description: t("description"),
    alternates: { languages: { uk: "/uk", en: "/en" } },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      // ThemeProvider's inline script sets the theme class before hydration
      suppressHydrationWarning
      className={`dark ${inter.variable} ${montserrat.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip">
        <ThemeProvider>
          <NextIntlClientProvider>
            <AuthProvider>
              <MotionProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <CompareBar />
              </MotionProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
