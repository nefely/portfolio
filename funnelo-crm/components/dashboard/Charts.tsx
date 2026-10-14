"use client";

import { formatMoney, formatMoneyCompact, formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Dashboard } from "@/types/crm";

// Графіки — звичайний HTML/CSS, без бібліотеки: даних мало (12 місяців,
// кілька етапів), кольори беруться з токенів теми (світла/темна без
// дублювання), а hover-підказка — CSS group-hover. Для скрінрідерів кожен
// графік дублюється прихованою таблицею.

/** Виграна виручка по місяцях — одна серія, тож без легенди: її називає заголовок. */
export function MonthlyWonChart({ months }: { months: Dashboard["monthly"] }) {
  const max = Math.max(...months.map((month) => month.won_value), 1);
  const peak = months.reduce(
    (best, month) => (month.won_value > best.won_value ? month : best),
    months[0],
  );
  const current = months.at(-1);
  // Пряма підписка лише для піку й поточного місяця — не на кожному стовпчику.
  const labelled = new Set([peak?.month, current?.month]);

  return (
    <figure className="space-y-2">
      {/* mt-5 — місце для верхньої підписки осі й мітки піку над стовпчиком. */}
      <div className="relative mt-5 h-52">
        {/* Рецесивна сітка: 0, половина й максимум. */}
        {[1, 0.5, 0].map((fraction) => (
          <div
            key={fraction}
            className="absolute inset-x-0 flex items-center gap-2"
            style={{ bottom: `${fraction * 100}%` }}
            aria-hidden
          >
            <span className="w-10 -translate-y-1/2 text-right text-[10px] text-muted-foreground tabular-nums">
              {formatMoneyCompact(max * fraction)}
            </span>
            <span className="h-px flex-1 -translate-y-1/2 bg-border" />
          </div>
        ))}

        <div className="absolute inset-y-0 right-0 left-12 flex items-end gap-1.5" aria-hidden>
          {months.map((month) => {
            const height = (month.won_value / max) * 100;
            return (
              <div
                key={month.month}
                className="group/bar relative flex h-full flex-1 items-end justify-center"
              >
                {/* Зона наведення — уся колонка, а не лише сам стовпчик. */}
                <div
                  className={cn(
                    "w-full max-w-9 rounded-t-[4px] bg-primary/85 transition-colors group-hover/bar:bg-primary",
                    month.month !== current?.month && "bg-primary/55",
                  )}
                  style={{ height: `${Math.max(height, month.won_value > 0 ? 1.5 : 0)}%` }}
                />
                {labelled.has(month.month) && month.won_value > 0 && (
                  <span
                    className="absolute text-[10px] font-medium text-muted-foreground tabular-nums group-hover/bar:opacity-0"
                    style={{ bottom: `calc(${height}% + 4px)` }}
                  >
                    {formatMoneyCompact(month.won_value)}
                  </span>
                )}
                <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden min-w-32 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md group-hover/bar:block">
                  <p className="font-medium">
                    {formatMonth(month.month)} {month.month.slice(0, 4)}
                  </p>
                  <p className="tabular-nums">{formatMoney(month.won_value)} won</p>
                  <p className="text-muted-foreground tabular-nums">
                    {month.won_count} won · {month.lost_count} lost
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ml-12 flex gap-1.5" aria-hidden>
        {months.map((month) => (
          <span key={month.month} className="flex-1 text-center text-[10px] text-muted-foreground">
            {formatMonth(month.month)}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Won revenue by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Won revenue</th>
            <th>Deals won</th>
            <th>Deals lost</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month}>
              <td>{month.month}</td>
              <td>{formatMoney(month.won_value)}</td>
              <td>{month.won_count}</td>
              <td>{month.lost_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/**
 * Відкрита воронка по етапах. Колір етапу — його ідентичність із налаштувань,
 * але назва завжди підписана поруч, тож колір не єдиний носій сенсу.
 */
export function PipelineByStage({ stages }: { stages: Dashboard["by_stage"] }) {
  const open = stages.filter((stage) => stage.kind === "open");
  const max = Math.max(...open.map((stage) => stage.value), 1);

  return (
    <div className="space-y-3">
      {open.map((stage) => (
        <div key={stage.stage_id} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">{stage.name}</span>
            <span className="text-muted-foreground tabular-nums">
              {stage.count} ·{" "}
              <span className="font-medium text-foreground">{formatMoneyCompact(stage.value)}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${(stage.value / max) * 100}%`, backgroundColor: stage.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
