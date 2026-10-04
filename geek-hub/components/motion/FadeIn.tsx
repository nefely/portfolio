"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { useMountAnimation } from "@/hooks/useMountAnimation";

// Поява при монтуванні (перехід сторінок). Лише opacity/transform — без
// layout/paint. На першому завантаженні не ховаємо серверний HTML (див.
// useMountAnimation); prefers-reduced-motion обробляє MotionConfig у Providers.
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}) {
  const animate = useMountAnimation();
  return (
    <m.div
      className={className}
      initial={animate ? { opacity: 0, y } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
