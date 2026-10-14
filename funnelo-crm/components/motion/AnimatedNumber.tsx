"use client";

import { useEffect } from "react";
import { animate, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Число, що "відлічується" до значення. Текст оновлює Motion напряму в DOM
 * через motion value — React-компонент не перерендерюється на кожному кадрі.
 * При зміні value (наприклад, Team → My numbers) анімує від поточного числа.
 *
 * format має бути стабільною функцією (модульною), бо useTransform бере її
 * один раз.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const current = useMotionValue(reduceMotion ? value : 0);
  const text = useTransform(current, format);

  useEffect(() => {
    if (reduceMotion) {
      current.set(value);
      return;
    }
    const controls = animate(current, value, { duration: 0.9, ease: EASE_OUT });
    return () => controls.stop();
  }, [value, reduceMotion, current]);

  return <m.span className={className}>{text}</m.span>;
}
