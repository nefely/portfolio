"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthListener } from "./AuthListener";
import { QueryProvider } from "./QueryProvider";

// LazyMotion + domAnimation + компоненти `m.*` замість `motion.*`: у бандл
// потрапляє лише потрібна частина motion (~15 КБ замість ~34 КБ).
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <LazyMotion features={domAnimation} strict>
        <TooltipProvider>
          <AuthListener />
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </LazyMotion>
    </QueryProvider>
  );
}
