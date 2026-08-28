import type { HTMLAttributes, ReactNode } from "react"

import { Reveal } from "@/components/shared/reveal"
import { cn } from "@/lib/utils"

type SurfaceProps = {
  children: ReactNode
  className?: string
  delayMs?: number
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">

/** Soft elevation wrapper for primary content cards */
export function Surface({
  children,
  className,
  delayMs = 100,
  ...props
}: SurfaceProps) {
  return (
    <Reveal delayMs={delayMs} className={cn("group/surface", className)} {...props}>
      <div className="[&_[data-slot=card]]:transition-[box-shadow,ring-color] [&_[data-slot=card]]:duration-300 hover:[&_[data-slot=card]]:shadow-[0_18px_50px_-28px_color-mix(in_oklch,var(--foreground)_35%,transparent)] hover:[&_[data-slot=card]]:ring-foreground/15">
        {children}
      </div>
    </Reveal>
  )
}
