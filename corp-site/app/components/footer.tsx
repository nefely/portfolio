"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-sm text-neutral-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Apex Growth. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <Link href="mailto:hello@apexgrowth.co" className="transition-colors hover:text-white">
            hello@apexgrowth.co
          </Link>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="cursor-pointer transition-colors hover:text-white"
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
