"use client"

import Link from "next/link"
import { useTransition } from "react"
import { Check, ChevronDown, MapPin } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { switchBusinessAction } from "@/lib/actions/business"
import { businessLabel } from "@/lib/format"
import { ONBOARDING_PATHS } from "@/lib/storefront-paths"
import { cn } from "@/lib/utils"

export type DeliveryBusinessOption = { id: string; name: string; postcode: string }

/** "Delivery to" in the top bar: which of the member's businesses orders go to, switchable when there are several. */
export function DeliveryBusinessPicker({
  businesses,
  activeBusinessId,
  isAuthenticated,
  onRequireAuth,
  className,
}: {
  businesses: DeliveryBusinessOption[]
  activeBusinessId: string | null
  isAuthenticated: boolean
  onRequireAuth?: () => void
  className?: string
}) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const active = businesses.find((b) => b.id === activeBusinessId) ?? businesses[0] ?? null

  const shellClass = cn(
    "flex min-w-0 items-center justify-between gap-2 rounded-[2px] border border-[var(--border-subtle)] px-3 py-1.5 text-left hover:bg-muted/40",
    className
  )
  const content = (
    <div className="flex min-w-0 items-start gap-2">
      <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--brand-navy)]" />
      <span className="flex min-w-0 flex-col truncate">
        <span className="mb-1 text-[11px] font-semibold uppercase leading-none tracking-wider text-muted-foreground">
          {t("storefront.deliveryLabel")}
        </span>
        <span className="truncate text-sm font-medium leading-none text-[var(--brand-navy)]">
          {active ? businessLabel(active.name, active.postcode) : t("storefront.selectAddress")}
        </span>
      </span>
    </div>
  )
  const chevron = <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />

  if (!isAuthenticated) {
    return (
      <button type="button" className={shellClass} onClick={onRequireAuth}>
        {content}
        {chevron}
      </button>
    )
  }
  if (!businesses.length) {
    return (
      <Link href={ONBOARDING_PATHS.business} className={shellClass}>
        {content}
        {chevron}
      </Link>
    )
  }
  if (businesses.length === 1) {
    return <div className={cn(shellClass, "cursor-default")}>{content}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={pending} className={cn(shellClass, "outline-none data-open:bg-muted/40")}>
        {content}
        {chevron}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64 rounded-[2px] p-1">
        {businesses.map((business) => {
          const selected = business.id === active?.id
          return (
            <DropdownMenuItem
              key={business.id}
              className="gap-3 py-2.5"
              onClick={() => {
                if (!selected) startTransition(() => switchBusinessAction(business.id))
              }}
            >
              <Check className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")} />
              <span className="min-w-0 truncate">{businessLabel(business.name, business.postcode)}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
