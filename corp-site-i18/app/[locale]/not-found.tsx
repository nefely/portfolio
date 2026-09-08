import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
	const t = await getTranslations("notFound");

	return (
		<div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center sm:px-6">
			<h1 className="text-foreground text-3xl font-bold tracking-tight">{t("title")}</h1>
			<p className="text-muted mt-3">{t("body")}</p>
			<Link
				href="/"
				className="bg-primary text-primary-foreground hover:bg-primary-hover mt-8 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
			>
				{t("backHome")}
			</Link>
		</div>
	);
}
