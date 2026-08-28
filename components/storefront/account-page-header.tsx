import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type AccountPageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/** Storefront hesap sayfaları — düz başlık, ekstra kart bandı yok */
export function AccountPageHeader({
  title,
  description,
  actions,
  className,
}: AccountPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">
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
