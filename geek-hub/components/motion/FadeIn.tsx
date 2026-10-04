"use client";

import type { ReactNode } from "react";
import { m, useReducedMotion } from "motion/react";

// Анімуємо лише opacity/transform — вони не викликають layout/paint і йдуть
// на компоновщик. З prefers-reduced-motion — без зсуву.
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
