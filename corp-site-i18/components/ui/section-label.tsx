import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<span className="text-primary inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-[0.2em] uppercase">
			<span aria-hidden>[</span>
			{children}
			<span aria-hidden>]</span>
		</span>
	);
}
