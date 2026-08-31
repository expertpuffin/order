import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type AccountPageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
  "data-tour"?: string
}

/** Storefront hesap sayfaları — Terminal/Ledger başlık */
export function AccountPageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  "data-tour": dataTour,
}: AccountPageHeaderProps) {
  return (
    <div
      data-tour={dataTour}
      className={cn(
        "flex flex-col gap-3 border-b border-[var(--sidebar-border)] pb-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {eyebrow ? (
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-[var(--brand-navy)] sm:text-[22px]">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
