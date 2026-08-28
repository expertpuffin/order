"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageRevealProps = {
  children: ReactNode
  className?: string
}

/** Re-triggers a soft entrance on each route change */
export function PageReveal({ children, className }: PageRevealProps) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className={cn(
        "flex flex-1 flex-col gap-6 duration-500 ease-out motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1",
        className
      )}
    >
      {children}
    </div>
  )
}
