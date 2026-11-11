"use client"

import { useT } from "@/components/i18n/i18n-provider"
import { choiceClass } from "@/components/brand/choice"
import { isMorningSlot } from "@/lib/checkout-slots"
import type { FulfillmentMethod } from "@/lib/domain"
import { slotDisplayLabel, slotOrderValue } from "@/lib/slot-format"
import { cn } from "@/lib/utils"

/** Time slots of one day, split into morning and afternoon. */
export function SlotGrid({
  starts,
  method,
  value,
  onChange,
}: {
  starts: string[]
  method: FulfillmentMethod
  value: string
  onChange: (value: string) => void
}) {
  const t = useT()
  const groups = [
    { labelKey: "cart.checkoutMorning", starts: starts.filter(isMorningSlot) },
    { labelKey: "cart.checkoutAfternoon", starts: starts.filter((s) => !isMorningSlot(s)) },
  ].filter((group) => group.starts.length > 0)

  return (
    <>
      {groups.map((group) => (
        <div key={group.labelKey} className="space-y-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {t(group.labelKey)}
          </p>
          <div className={cn("grid gap-2", method === "collection" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
            {group.starts.map((start) => {
              const slot = slotOrderValue(start, method)
              return (
                <button
                  key={start}
                  type="button"
                  onClick={() => onChange(slot)}
                  className={cn("rounded-[2px] border py-2 text-sm font-medium tabular-nums transition-colors", choiceClass(value === slot))}
                >
                  {slotDisplayLabel(start, method)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
