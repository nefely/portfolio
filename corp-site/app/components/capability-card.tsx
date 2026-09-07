"use client";

import { motion } from "motion/react";

export function CapabilityCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full rounded-2xl border border-white/10 bg-white/3 p-8 transition-colors hover:border-violet-400/40"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm text-neutral-400">{description}</p>
    </motion.div>
  );
}
