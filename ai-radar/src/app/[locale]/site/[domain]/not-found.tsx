import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function SiteNotFound() {
  const t = useTranslations();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">{t("site.notFoundTitle")}</h1>
      <p className="mt-2 text-fg-muted">{t("errors.notFoundText")}</p>
      <Link href="/catalog" className="mt-6 inline-block text-accent-text hover:underline">
        {t("site.back")}
      </Link>
    </div>
  );
}
