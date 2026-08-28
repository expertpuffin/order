"use client"

import type { TooltipRenderProps } from "react-joyride"
import { Check, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TourTooltipContent = {
  eyebrow: string
  title: string
  body: string
  tips: string[]
}

function readContent(step: TooltipRenderProps["step"]): TourTooltipContent {
  const data = (step.data ?? {}) as Partial<TourTooltipContent>
  return {
    eyebrow: data.eyebrow || "Tour",
    title: typeof step.title === "string" ? step.title : "Guide",
    body:
      typeof step.content === "string"
        ? step.content
        : data.body || "",
    tips: Array.isArray(data.tips) ? data.tips : [],
  }
}

export function TourTooltip(props: TooltipRenderProps) {
  const {
    continuous,
    index,
    size,
    isLastStep,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    tooltipProps,
    step,
  } = props

  const content = readContent(step)
  const progress = size > 0 ? ((index + 1) / size) * 100 : 0

  return (
    <div
      {...tooltipProps}
      className={cn(
        "w-[min(100vw-2rem,400px)] overflow-hidden rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl",
        "ring-1 ring-black/5 dark:ring-white/10"
      )}
    >
      <div className="relative bg-gradient-to-br from-primary/15 via-popover to-popover px-4 pb-3 pt-4">
        <button
          type="button"
          className="absolute right-2.5 top-2.5 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          {...closeProps}
        >
          <X className="size-3.5" />
        </button>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="size-3" />
          {content.eyebrow}
        </div>

        <h2 className="pr-8 text-lg font-semibold tracking-tight">
          {content.title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {content.body}
        </p>

        {content.tips.length > 0 ? (
          <ul className="mt-3 space-y-1.5 rounded-xl border border-border/60 bg-background/70 p-2.5">
            {content.tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-[13px] leading-snug text-foreground/90"
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-border/70 px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>
            Step {index + 1} of {size}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            {...skipProps}
          >
            Skip tour
          </Button>

          <div className="flex items-center gap-1.5">
            {index > 0 ? (
              <Button type="button" variant="outline" size="sm" {...backProps}>
                <ChevronLeft className="size-3.5" />
                Back
              </Button>
            ) : null}
            {continuous ? (
              <Button type="button" size="sm" {...primaryProps}>
                {isLastStep ? "Done" : "Next"}
                {!isLastStep ? <ChevronRight className="size-3.5" /> : null}
              </Button>
            ) : (
              <Button type="button" size="sm" {...closeProps}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
