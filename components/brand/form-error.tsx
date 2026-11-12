import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** An error shown in place, above or inside a form. `compact` in dialogs and narrow forms. */
export function FormError({
  children,
  compact = false,
  className,
}: {
  children: ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-[2px] border border-destructive/30 text-destructive",
        compact ? "bg-destructive/10 px-3 py-2 text-xs" : "bg-destructive/5 px-3 py-2 text-sm",
        className
      )}
    >
      {children}
    </p>
  )
}
