import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-accent-text">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-fg-muted">{t("notFoundText")}</p>
      <Link href="/" className="mt-6 inline-block text-accent-text hover:underline">
        {t("home")}
      </Link>
    </div>
  );
}
