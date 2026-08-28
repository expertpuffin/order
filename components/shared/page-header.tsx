import type { ReactNode } from "react"

import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  /** Soft monochrome hero band behind the header */
  elevated?: boolean
  className?: string
  tourId?: string
}

export function PageHeader({
  title,
  description,
  actions,
  elevated = true,
  className,
  tourId,
}: PageHeaderProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        elevated && "relative",
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="h-px w-10 bg-foreground/25" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )

  if (!elevated) {
    return (
      <Reveal>
        <div data-tour={tourId}>{content}</div>
      </Reveal>
    )
  }

  return (
    <Reveal>
      <div
        data-tour={tourId}
        className="relative overflow-hidden rounded-2xl border border-border/60 px-5 py-5 sm:px-6 sm:py-6"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, var(--background) 0%, color-mix(in oklch, var(--foreground) 4%, var(--background)) 48%, color-mix(in oklch, var(--foreground) 2%, var(--background)) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: "var(--foreground)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
          aria-hidden
        />
        <div className="relative">{content}</div>
      </div>
    </Reveal>
  )
}
