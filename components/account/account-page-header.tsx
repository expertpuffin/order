import type { ReactNode } from "react"


type AccountPageHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
}

export function AccountPageHeader({
  title,
  description,
  eyebrow,
  actions,
}: AccountPageHeaderProps) {
  return (
    <div
      className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-1">
        {eyebrow ? (
          <p className="eyebrow">
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
