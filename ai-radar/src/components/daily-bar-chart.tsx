"use client";

import { useState } from "react";
import type { DayCount } from "@/lib/niche";

// Single-series column chart: daily launches in a niche.
// Specs (dataviz skill): columns ≤24px with a 4px rounded top and square base,
// 2px gaps, hairline recessive grid, one hue (--chart-1, validated for both
// themes), the peak labelled directly, every value on hover/focus and in a table.

const tag = (locale: string) => (locale === "uk" ? "uk-UA" : "en-US");

/** Round the axis max up to a clean 1/2/5 × 10ⁿ step. */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 5, 10].find((m) => m * pow >= v)!;
  return step * pow;
}

export function DailyBarChart({
  data,
  locale,
  title,
  valueLabel,
}: {
  data: DayCount[];
  locale: string;
  title: string;
  valueLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.count)));
  const peak = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);
  const num = new Intl.NumberFormat(tag(locale));
  const short = new Intl.DateTimeFormat(tag(locale), { day: "numeric", month: "short", timeZone: "UTC" });
  const long = new Intl.DateTimeFormat(tag(locale), { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" });
  const ticks = [max, max / 2, 0];
  const xLabels = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <figure className="min-w-0 pt-2" aria-label={title}>
      <div className="flex gap-2">
        {/* y axis: labels sit on the same positions as the gridlines */}
        <div aria-hidden="true" className="relative h-52 shrink-0 font-mono text-[11px] tabular-nums text-fg-subtle">
          <span className="invisible block leading-none">{num.format(max)}</span>
          {ticks.map((t, i) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 leading-none"
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            >
              {num.format(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* gridlines */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-52">
            {ticks.map((t, i) => (
              <div key={t} className="absolute inset-x-0 h-px bg-line" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
            ))}
          </div>

          {/* columns */}
          <div className="relative flex h-52 items-end gap-0.5" onPointerLeave={() => setActive(null)}>
            {data.map((d, i) => {
              const h = (d.count / max) * 100;
              const isActive = active === i;
              return (
                <div
                  key={d.date}
                  // the hit target is the whole column slot, not just the painted bar
                  className="group relative flex h-full min-w-0 flex-1 cursor-default items-end justify-center outline-none"
                  tabIndex={0}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`${long.format(new Date(d.date))}: ${num.format(d.count)} ${valueLabel}`}
                >
                  <div
                    className={`w-full max-w-6 rounded-t-sm transition-opacity ${
                      active === null || isActive ? "opacity-100" : "opacity-60"
                    } bg-chart-1 group-focus-visible:ring-2 group-focus-visible:ring-accent`}
                    style={{ height: `${Math.max(h, d.count > 0 ? 1.5 : 0)}%` }}
                  />
                  {i === peak && d.count > 0 && active === null && (
                    <span
                      className="pointer-events-none absolute whitespace-nowrap font-mono text-[11px] font-medium text-fg"
                      style={{ bottom: `calc(${h}% + 4px)` }}
                    >
                      {num.format(d.count)}
                    </span>
                  )}
                  {isActive && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute z-10 w-max rounded-lg border border-line-strong bg-surface-1 px-2.5 py-1.5 text-left shadow-lg shadow-black/20"
                      style={{
                        bottom: `calc(${h}% + 8px)`,
                        left: "50%",
                        // keep the tooltip inside the chart near the edges
                        transform: `translateX(${i < 3 ? "-15%" : i > data.length - 4 ? "-85%" : "-50%"})`,
                      }}
                    >
                      <p className="font-display text-sm font-semibold tabular-nums text-fg">{num.format(d.count)}</p>
                      <p className="text-[11px] text-fg-muted">{long.format(new Date(d.date))}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* x axis labels: first, middle, last */}
          <div aria-hidden="true" className="mt-2 flex gap-0.5 font-mono text-[11px] text-fg-subtle">
            {data.map((d, i) => (
              <span key={d.date} className="relative min-w-0 flex-1">
                {xLabels.has(i) && (
                  <span
                    className={`absolute whitespace-nowrap ${
                      i === 0 ? "left-0" : i === data.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2"
                    }`}
                  >
                    {short.format(new Date(d.date))}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* table view: every value reachable without hovering */}
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <th scope="row">{long.format(new Date(d.date))}</th>
              <td>{num.format(d.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
