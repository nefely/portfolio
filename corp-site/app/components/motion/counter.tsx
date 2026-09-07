"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

type CounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
};

/** Counts up from 0 to `value` once it scrolls into view. */
export function Counter({ value, prefix = "", suffix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
