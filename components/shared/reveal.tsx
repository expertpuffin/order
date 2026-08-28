"use client"

import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type RevealProps = {
  children: ReactNode
  className?: string
  delayMs?: number
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">

/** Subtle fade/slide-in for page sections — monochrome motion only */
export function Reveal({
  children,
  className,
  delayMs = 0,
  ...props
}: RevealProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setVisible(true)
      return
    }
    const id = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(id)
  }, [delayMs])

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
