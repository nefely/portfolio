"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

type FadeInProps = {
	children: ReactNode;
	delay?: number;
	y?: number;
	className?: string;
};

const variants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

export function FadeIn({ children, delay = 0, y = 20, className }: FadeInProps) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.3 }}
			transition={{ duration: 0.5, delay, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}

export function FadeInStagger({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.2 }}
			transition={{ staggerChildren: 0.1 }}
		>
			{children}
		</motion.div>
	);
}

export function FadeInStaggerItem({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			variants={variants}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
