"use client";

import { useState } from "react";

/**
 * Site favicon via our /api/favicon proxy, which already swaps missing icons for a
 * letter avatar. The local fallback below only covers network failures.
 */
export function Favicon({ domain, size = 40 }: { domain: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (failed) {
    return (
      <span
        style={style}
        className="flex shrink-0 items-center justify-center rounded-lg border border-line bg-surface-3 font-display text-sm font-semibold uppercase text-accent-text"
      >
        {domain[0]}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny proxied icon, next/image adds no value here
    <img
      src={`/api/favicon?domain=${encodeURIComponent(domain)}`}
      alt=""
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-lg border border-line bg-surface-3 p-1.5"
    />
  );
}
