"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthListener } from "./AuthListener";
import { QueryProvider } from "./QueryProvider";

// LazyMotion + domAnimation + компоненти `m.*` замість `motion.*`: у бандл
// потрапляє лише потрібна частина motion (~15 КБ замість ~34 КБ).
// reducedMotion="user": для prefers-reduced-motion Motion сам вимикає
// зсуви/масштаб, лишаючи тільки зміну прозорості.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <AuthListener />
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </MotionConfig>
      </LazyMotion>
    </QueryProvider>
  );
}
