"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
	const t = useTranslations("language");
	const locale = useLocale() as Locale;
	const pathname = usePathname();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function selectLocale(next: Locale) {
		setOpen(false);
		router.replace(pathname, { locale: next });
	}

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={t("label")}
				className="border-border text-foreground hover:bg-surface-hover flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-4"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
				</svg>
				<span className="uppercase">{locale}</span>
			</button>
			<AnimatePresence>
				{open && (
					<motion.ul
						role="listbox"
						initial={{ opacity: 0, y: -6, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -6, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className="border-border bg-surface absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border p-1 shadow-lg shadow-black/5"
					>
						{locales.map((code) => (
							<li key={code}>
								<button
									type="button"
									role="option"
									aria-selected={code === locale}
									onClick={() => selectLocale(code)}
									className={`hover:bg-surface-hover flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
										code === locale ? "text-primary font-semibold" : "text-foreground"
									}`}
								>
									{localeNames[code]}
									{code === locale && (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="size-4"
										>
											<path d="M20 6 9 17l-5-5" />
										</svg>
									)}
								</button>
							</li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</div>
	);
}
