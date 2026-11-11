"use client"

import { useState, useTransition } from "react"

import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { useT } from "@/components/i18n/i18n-provider"
import { notifyActionResult } from "@/lib/action-toast"
import { addCartItemAction } from "@/lib/actions/cart"
import type { CatalogProduct } from "@/lib/api/catalog"
import { cn } from "@/lib/utils"


/**
 * Choosing a unit and quantity of one product and adding it to the cart — the
 * product page panel and the quick-add sheet. The choice starts over whenever
 * `resetKey` changes (another product, the sheet reopening).
 */
export function useProductPurchase(product: CatalogProduct, businessId: string | null, resetKey: string = product.id) {
  const t = useT()
  const fresh = () => ({ key: resetKey, unit: product.packagingOptions[0], quantity: 0 })
  const [choice, setChoice] = useState(fresh)
  const [pending, startTransition] = useTransition()
  const current = choice.key === resetKey ? choice : fresh()
  if (current !== choice) setChoice(current)

  const add = (onAdded?: () => void) => {
    if (!businessId || pending || current.quantity < 1) return
    startTransition(async () => {
      const offerId = product.offerIdsByUnit[current.unit]
      const result = await addCartItemAction(businessId, {
        productId: product.id,
        quantity: current.quantity,
        unit: current.unit,
        ...(offerId ? { offerId } : {}),
      })
      if (notifyActionResult(result, t("storefront.addedToCart"))) onAdded?.()
    })
  }

  return {
    units: product.packagingOptions,
    unit: current.unit,
    setUnit: (unit: string) => setChoice({ ...current, unit }),
    quantity: current.quantity,
    setQuantity: (quantity: number) => setChoice({ ...current, quantity }),
    lineTotal: product.unitPrice != null && current.quantity > 0 ? product.unitPrice * current.quantity : null,
    pending,
    add,
  }
}

/** Unit and quantity pickers for a purchase from useProductPurchase. */
export function PurchaseFields({ purchase }: { purchase: ReturnType<typeof useProductPurchase> }) {
  const t = useT()
  return (
    <>
      <fieldset className="space-y-2.5">
        <FieldLegend>{t("storefront.unit")}</FieldLegend>
        <div className="flex flex-wrap" role="radiogroup" aria-label={t("storefront.unit")}>
          {purchase.units.map((option, index) => {
            const selected = purchase.unit === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={purchase.pending}
                onClick={() => purchase.setUnit(option)}
                className={cn(
                  "min-w-18 flex-1 border border-[var(--border-subtle)] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  index > 0 && "-ml-px",
                  selected ? "relative z-1 bg-[var(--brand-navy)] text-white" : "bg-background text-[var(--brand-navy)] hover:bg-muted/40"
                )}
              >
                {option}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2.5">
        <FieldLegend>{t("storefront.quantity")}</FieldLegend>
        <QuantityStepper
          value={purchase.quantity}
          onChange={purchase.setQuantity}
          min={0}
          editable
          size="md"
          disabled={purchase.pending}
        />
      </fieldset>
    </>
  )
}

function FieldLegend({ children }: { children: string }) {
  return <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</span>
}
