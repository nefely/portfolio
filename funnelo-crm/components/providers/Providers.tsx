"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthListener } from "./AuthListener";
import { QueryProvider } from "./QueryProvider";

// LazyMotion + domAnimation + компоненти `m.*` замість `motion.*`: у бандл
// потрапляє лише потрібна частина motion. reducedMotion="user": для
// prefers-reduced-motion Motion сам вимикає зсуви, лишаючи прозорість.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delay={300}>
              <AuthListener />
              {children}
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </MotionConfig>
        </LazyMotion>
      </QueryProvider>
    </ThemeProvider>
  );
}
