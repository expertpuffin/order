import type { ReactNode } from "react"

import {
  PuffinIcon,
  type PuffinIconName,
} from "@/components/brand/puffin-icon"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: PuffinIconName
  eyebrow?: string
  title: string
  body?: string
  actions?: ReactNode
  className?: string
  /** Compact for side panels */
  compact?: boolean
  /** When false, skip outer bordered panel (already inside a card) */
  framed?: boolean
}

export function EmptyState({
  icon,
  eyebrow,
  title,
  body,
  actions,
  className,
  compact = false,
  framed = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact
          ? "gap-3 px-5 py-8"
          : framed
            ? "gap-4 rounded-[2px] border border-[var(--sidebar-border)] bg-white px-6 py-16"
            : "gap-4 px-6 py-16",
        className
      )}
    >
      <PuffinIcon
        name={icon}
        className={cn(compact ? "size-16" : "size-24", "text-[var(--brand-navy)]")}
        label={title}
      />
      <div className="space-y-1">
        {eyebrow ? (
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <p
          className={cn(
            "font-semibold tracking-tight text-[var(--brand-navy)]",
            compact ? "text-sm" : "text-[15px]"
          )}
        >
          {title}
        </p>
        {body ? (
          <p
            className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "max-w-sm text-sm"
            )}
          >
            {body}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap justify-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
