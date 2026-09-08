"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/site";
import { useMounted } from "@/lib/use-mounted";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import Image from "next/image";

const NAV_ITEMS = [
	{ href: "/", key: "home" },
	{ href: "/team", key: "team" },
	{ href: "/careers", key: "careers" },
] as const;

export function Header() {
	const t = useTranslations("nav");
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const mounted = useMounted();
	const { resolvedTheme } = useTheme();
	const isDark = mounted && resolvedTheme === "dark";

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	function isActive(href: string) {
		if (href === "/") return pathname === "/";
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	const overlay = (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						onClick={() => setOpen(false)}
						className="fixed inset-0 z-40 bg-black/40 md:hidden"
					/>
					<motion.nav
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="border-border bg-background fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col border-l md:hidden"
					>
						<div className="border-border flex h-16 items-center justify-between border-b px-5">
							<span className="text-foreground text-sm font-semibold">{t("menu")}</span>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label={t("close")}
								className="border-border text-foreground flex size-9 items-center justify-center rounded-md border"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="size-4.5"
								>
									<path d="M18 6 6 18M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="flex flex-1 flex-col gap-1 px-3 py-4">
							{NAV_ITEMS.map((item, index) => (
								<Link
									key={item.key}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`flex items-baseline gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors ${
										isActive(item.href)
											? "bg-surface text-primary"
											: "text-foreground/80 hover:bg-surface-hover"
									}`}
								>
									<span className="text-muted font-mono text-xs">0{index + 1}</span>
									{t(item.key)}
								</Link>
							))}
						</div>

						<div className="border-border mt-auto px-5 py-5">
							<Link
								href="/careers"
								onClick={() => setOpen(false)}
								className="bg-primary text-primary-foreground block rounded-md px-4 py-3 text-center text-sm font-semibold"
							>
								{t("cta")}
							</Link>
						</div>
					</motion.nav>
				</>
			)}
		</AnimatePresence>
	);

	return (
		<header className="border-border/80 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link
					href="/"
					onClick={() => setOpen(false)}
					className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight"
				>
					<Image
						src={isDark ? "/nexora_logo.svg" : "/nexora_logo-dark.svg"}
						alt={SITE_NAME}
						width={115.5}
						height={45}
					/>
				</Link>

				<nav className="hidden items-center gap-1 md:flex">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.key}
							href={item.href}
							className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
								isActive(item.href)
									? "border-primary text-primary"
									: "text-foreground/80 hover:text-foreground border-transparent"
							}`}
						>
							{t(item.key)}
						</Link>
					))}
				</nav>

				<div className="hidden items-center gap-2 md:flex">
					<LanguageSwitcher />
					<ThemeToggle />
					<Link
						href="/careers"
						className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-md px-4 py-2 text-sm font-semibold transition-colors"
					>
						{t("cta")}
					</Link>
				</div>

				<div className="flex items-center gap-2 md:hidden">
					<LanguageSwitcher />
					<ThemeToggle />
					<button
						type="button"
						onClick={() => setOpen(true)}
						aria-label={t("menu")}
						aria-expanded={open}
						className="border-border text-foreground relative flex size-9 shrink-0 items-center justify-center rounded-md border"
					>
						<span className="sr-only">{t("menu")}</span>
						<div className="flex h-3.5 w-4.5 flex-col justify-between">
							<span className="h-0.5 w-full rounded-full bg-current" />
							<span className="h-0.5 w-full rounded-full bg-current" />
							<span className="h-0.5 w-full rounded-full bg-current" />
						</div>
					</button>
				</div>
			</div>

			{mounted && createPortal(overlay, document.body)}
		</header>
	);
}
