import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/site";

const COMPANY_LINKS = [
	{ href: "/", key: "home" },
	{ href: "/team", key: "team" },
	{ href: "/careers", key: "careers" },
] as const;

export function Footer() {
	const t = useTranslations();
	const year = new Date().getFullYear();

	return (
		<footer className="border-border border-t">
			<div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
				<div className="sm:col-span-2 lg:col-span-2">
					<div className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
						<span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="size-4.5"
							>
								<path d="M13 2 3 14h7l-1 8 11-14h-7l1-6Z" />
							</svg>
						</span>
						{SITE_NAME}
					</div>
					<p className="text-muted mt-3 max-w-xs text-sm">{t("footer.tagline")}</p>
				</div>

				<div>
					<h3 className="text-foreground text-sm font-semibold">{t("footer.company")}</h3>
					<ul className="mt-4 space-y-2.5">
						{COMPANY_LINKS.map((item) => (
							<li key={item.key}>
								<Link
									href={item.href}
									className="text-muted hover:text-foreground text-sm transition-colors"
								>
									{t(`nav.${item.key}`)}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="text-foreground text-sm font-semibold">{t("footer.connect")}</h3>
					<ul className="mt-4 space-y-2.5">
						<li>
							<a
								href="mailto:hello@nexora.example"
								className="text-muted hover:text-foreground text-sm transition-colors"
							>
								hello@nexora.example
							</a>
						</li>
						<li>
							<a
								href="#"
								className="text-muted hover:text-foreground text-sm transition-colors"
							>
								LinkedIn
							</a>
						</li>
						<li>
							<a
								href="#"
								className="text-muted hover:text-foreground text-sm transition-colors"
							>
								GitHub
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div className="border-border border-t">
				<div className="text-muted mx-auto max-w-6xl px-4 py-6 text-xs sm:px-6 lg:px-8">
					© {year} {SITE_NAME}. {t("footer.rights")}
				</div>
			</div>
		</footer>
	);
}
