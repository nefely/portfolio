import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          {t("text")}{" "}
          <a href="https://freeserp.ai/docs.php" target="_blank" rel="noreferrer" className="text-accent-text hover:underline">
            FreeSerp API
          </a>{" "}
          (index=sites).
        </p>
        <Link href="/about" className="hover:text-fg">
          {t("plan")}
        </Link>
      </div>
    </footer>
  );
}
