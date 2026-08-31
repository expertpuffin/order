"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Check, ChevronDown, MapPin } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { switchBusinessAction } from "@/lib/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type DeliveryBusinessOption = {
  id: string
  name: string
  postcode: string
}

type DeliveryBusinessPickerProps = {
  businesses: DeliveryBusinessOption[]
  activeBusinessId: string | null
  isAuthenticated: boolean
  onRequireAuth?: () => void
  className?: string
  variant?: "default" | "ledger"
}

function formatBusinessLabel(business: DeliveryBusinessOption) {
  const name = business.name.trim()
  const postcode = business.postcode.trim()
  if (name && postcode) return `${name} · ${postcode}`
  return name || postcode || "—"
}

export function DeliveryBusinessPicker({
  businesses,
  activeBusinessId,
  isAuthenticated,
  onRequireAuth,
  className,
  variant = "default",
}: DeliveryBusinessPickerProps) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const ledger = variant === "ledger"

  const active =
    businesses.find((b) => b.id === activeBusinessId) ?? businesses[0] ?? null

  const shellClass = cn(
    "flex min-w-0 items-center text-left",
    ledger
      ? "justify-between gap-2 rounded-[2px] border border-[var(--sidebar-border)] px-3 py-1.5 hover:bg-muted/40"
      : "gap-2 rounded-xl border px-3 py-2",
    className
  )

  const content = ledger ? (
    <div className="flex min-w-0 items-start gap-2">
      <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--brand-navy)]" />
      <span className="flex min-w-0 flex-col truncate">
        <span className="mb-1 text-[11px] font-semibold uppercase leading-none tracking-wider text-muted-foreground">
          {t("storefront.deliveryLabel")}
        </span>
        <span className="truncate text-sm font-medium leading-none text-[var(--brand-navy)]">
          {active
            ? formatBusinessLabel(active)
            : t("storefront.selectAddress")}
        </span>
      </span>
    </div>
  ) : (
    <>
      <MapPin className="size-4 shrink-0 text-primary" />
      <span className="min-w-0 truncate text-sm">
        <span className="block text-[11px] text-muted-foreground">
          {t("storefront.deliveryTo")}
        </span>
        <span className="block truncate font-medium text-[var(--brand-navy)]">
          {active
            ? formatBusinessLabel(active)
            : t("storefront.selectAddress")}
        </span>
      </span>
    </>
  )

  const chevron = (
    <ChevronDown
      className={cn(
        "ml-auto size-4 shrink-0",
        ledger ? "ml-2 text-muted-foreground" : "text-primary"
      )}
    />
  )

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
      <Link href="/onboarding/business" className={shellClass}>
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
      <DropdownMenuTrigger
        disabled={pending}
        className={cn(
          shellClass,
          "outline-none hover:bg-muted/40 data-open:bg-muted/40"
        )}
      >
        {content}
        {chevron}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn("min-w-64 p-1", ledger ? "rounded-[2px]" : "rounded-xl")}
      >
        {businesses.map((business) => {
          const selected = business.id === active?.id
          return (
            <DropdownMenuItem
              key={business.id}
              className="gap-3 py-2.5"
              onClick={() => {
                if (selected) return
                startTransition(async () => {
                  await switchBusinessAction(business.id)
                  router.refresh()
                })
              }}
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  selected ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="min-w-0 truncate">
                {formatBusinessLabel(business)}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
