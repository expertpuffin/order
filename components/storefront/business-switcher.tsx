"use client"

import { useTransition } from "react"
import { Check } from "lucide-react"

import { switchBusinessAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BusinessOption = {
  id: string
  tradingName: string
  status: string
}

type BusinessSwitcherProps = {
  businesses: BusinessOption[]
  activeBusinessId: string
}

export function BusinessSwitcher({
  businesses,
  activeBusinessId,
}: BusinessSwitcherProps) {
  const [pending, startTransition] = useTransition()

  if (businesses.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-2">
      {businesses.map((business) => {
        const active = business.id === activeBusinessId
        return (
          <Button
            key={business.id}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            disabled={pending || active}
            className={cn("rounded-full", active && "pointer-events-none")}
            onClick={() => {
              startTransition(async () => {
                await switchBusinessAction(business.id)
              })
            }}
          >
            {active ? <Check data-icon="inline-start" /> : null}
            {business.tradingName || business.id}
          </Button>
        )
      })}
    </div>
  )
}
