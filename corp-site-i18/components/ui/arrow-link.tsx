import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export function ArrowLink({
	href,
	children,
	variant = "solid",
	className = "",
}: {
	href: string;
	children: ReactNode;
	variant?: "solid" | "outline" | "invert";
	className?: string;
}) {
	const styles =
		variant === "solid"
			? "bg-primary text-primary-foreground hover:bg-primary-hover"
			: variant === "invert"
				? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
				: "border border-border text-foreground hover:bg-surface-hover";

	return (
		<Link
			href={href}
			className={`group inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-colors ${styles} ${className}`}
		>
			{children}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="size-4 transition-transform group-hover:translate-x-0.5"
			>
				<path d="M5 12h14M13 6l6 6-6 6" />
			</svg>
		</Link>
	);
}
