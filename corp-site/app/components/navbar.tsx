"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/team", label: "Team" },
  { href: "/careers", label: "Careers" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-lg font-semibold tracking-tight text-white"
        >
          Apex<span className="text-violet-400">Growth</span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-neutral-300 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-violet-200 md:inline-block"
          >
            Contact now
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white md:hidden"
          >
            <span className="relative block h-3.5 w-4">
              <motion.span
                animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-current"
              />
              <motion.span
                animate={{ opacity: open ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-current"
              />
              <motion.span
                animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-3 h-0.5 rounded-full bg-current"
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/5 md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/#contact"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-white px-4 py-2.5 text-center text-sm font-medium text-neutral-950"
                >
                  Contact now
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
