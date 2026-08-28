import type { ReactNode } from "react"

import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

export type InsightItem = {
  label: string
  value: string | number
  hint?: string
}

type InsightStripProps = {
  items: InsightItem[]
  className?: string
  /** Optional trailing action (e.g. filter summary) */
  trailing?: ReactNode
}

/** Monochrome summary chips for list pages */
export function InsightStrip({ items, className, trailing }: InsightStripProps) {
  if (!items.length) return null

  return (
    <Reveal delayMs={60}>
      <div
        className={cn(
          "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
          className
        )}
      >
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 px-4 py-3 transition-colors duration-300 hover:border-foreground/20 hover:bg-card"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-foreground/20 transition-all duration-300 group-hover:bg-foreground/45"
              aria-hidden
            />
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {item.label}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
            </div>
            {item.hint ? (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {item.hint}
              </div>
            ) : null}
          </div>
        ))}
        {trailing}
      </div>
    </Reveal>
  )
}
