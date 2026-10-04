"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { useMountAnimation } from "@/hooks/useMountAnimation";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  // Порядковий номер у ряду — дає "хвилю" появи замість одночасного спалаху.
  index?: number;
  className?: string;
}

// Поява елемента, коли він доходить до в'юпорту. Лише opacity/transform —
// без layout/paint, анімація йде на компоновщику. once: кожен елемент
// анімується один раз. Motion використовує спільний IntersectionObserver для
// однакових налаштувань, тож сотні карток не створюють сотні обсерверів.
// Контент першого серверного рендера не ховаємо (див. useMountAnimation), а
// prefers-reduced-motion обробляє MotionConfig у Providers.
export function Reveal({ children, index = 0, className }: RevealProps) {
  const animate = useMountAnimation();
  return (
    <m.div
      className={className}
      initial={animate ? { opacity: 0, y: 18 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(index, 8) * 0.045 }}
    >
      {children}
    </m.div>
  );
}
