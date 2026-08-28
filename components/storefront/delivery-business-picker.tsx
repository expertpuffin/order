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
}: DeliveryBusinessPickerProps) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const active =
    businesses.find((b) => b.id === activeBusinessId) ?? businesses[0] ?? null

  const shellClass = cn(
    "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left",
    className
  )

  const content = (
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

  if (!isAuthenticated) {
    return (
      <button type="button" className={shellClass} onClick={onRequireAuth}>
        {content}
        <ChevronDown className="ml-auto size-4 shrink-0 text-primary" />
      </button>
    )
  }

  if (!businesses.length) {
    return (
      <Link href="/onboarding/business" className={shellClass}>
        {content}
        <ChevronDown className="ml-auto size-4 shrink-0 text-primary" />
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
        className={cn(shellClass, "outline-none hover:bg-muted/40 data-open:bg-muted/40")}
      >
        {content}
        <ChevronDown className="ml-auto size-4 shrink-0 text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64 rounded-xl p-1">
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
              <span className="min-w-0 truncate">{formatBusinessLabel(business)}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
