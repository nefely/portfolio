"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/site";
import { useMounted } from "@/lib/use-mounted";
import { useTheme } from "@/components/theme-provider";

const COMPANY_LINKS = [
	{ href: "/", key: "home" },
	{ href: "/team", key: "team" },
	{ href: "/careers", key: "careers" },
] as const;

export function Footer() {
	const t = useTranslations();
	const year = new Date().getFullYear();
	const mounted = useMounted();
	const { resolvedTheme } = useTheme();
	const isDark = mounted && resolvedTheme === "dark";

	return (
		<footer className="border-border border-t">
			<div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
				<div className="sm:col-span-2 lg:col-span-2">
					<div className="text-foreground flex items-center text-lg font-bold tracking-tight">
						<Image
							src={isDark ? "/nexora_logo.svg" : "/nexora_logo-dark.svg"}
							alt={SITE_NAME}
							width={115.5}
							height={45}
						/>
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
