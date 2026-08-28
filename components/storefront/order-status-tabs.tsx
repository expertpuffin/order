"use client"

import Link from "next/link"

import { useT } from "@/components/i18n/i18n-provider"
import { cn } from "@/lib/utils"

const STATUS_VALUES = [
  "",
  "draft",
  "submitted",
  "sent",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "collected",
  "cancelled",
] as const

type OrderStatusTabsProps = {
  active: string
  preserve?: Record<string, string | undefined>
}

export function OrderStatusTabs({ active, preserve }: OrderStatusTabsProps) {
  const t = useT()

  function label(value: string) {
    if (!value) return t("orders.filterAll")
    const key = `status.${value}`
    const translated = t(key)
    return translated === key ? value.replaceAll("_", " ") : translated
  }

  function href(value: string) {
    const params = new URLSearchParams()
    if (preserve) {
      for (const [key, val] of Object.entries(preserve)) {
        if (val && key !== "status" && key !== "page") {
          params.set(key, val)
        }
      }
    }
    if (value) params.set("status", value)
    const qs = params.toString()
    return qs ? `/orders?${qs}` : "/orders"
  }

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {STATUS_VALUES.map((value) => {
        const isActive = active === value
        return (
          <Link
            key={value || "all"}
            href={href(value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-white text-[var(--brand-navy)] ring-1 ring-border hover:bg-muted/50"
            )}
          >
            {label(value)}
          </Link>
        )
      })}
    </div>
  )
}
