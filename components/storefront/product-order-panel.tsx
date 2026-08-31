"use client"

import { useEffect, useState, useTransition, type ReactNode } from "react"

import { addCartItemAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import { ProductQuantityControl } from "@/components/storefront/product-quantity-control"
import type { CatalogProduct } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProductOrderPanelProps = {
  product: CatalogProduct
  businessId: string | null
  className?: string
  sticky?: boolean
}

function FieldLegend({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  )
}

export function ProductOrderPanel({
  product,
  businessId,
  className,
  sticky = false,
}: ProductOrderPanelProps) {
  const t = useT()
  const { requestAddToCart, canOrder } = useAuthGate()
  const options =
    product.packagingOptions.length > 0
      ? product.packagingOptions
      : ["EACH"]
  const [unit, setUnit] = useState(options[0] ?? "EACH")
  const [quantity, setQuantity] = useState(0)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const nextOptions =
      product.packagingOptions.length > 0
        ? product.packagingOptions
        : ["EACH"]
    setUnit(nextOptions[0] ?? "EACH")
    setQuantity(0)
  }, [product.id, product.packagingOptions])

  const unitPrice = product.unitPrice
  const lineTotal =
    unitPrice != null && quantity > 0 ? unitPrice * quantity : null

  const add = () => {
    if (!canOrder || !businessId) {
      requestAddToCart(product)
      return
    }
    if (pending || quantity < 1) return
    startTransition(async () => {
      const offerId = product.offerIdsByUnit[unit.toUpperCase()]
      const result = await addCartItemAction(businessId, {
        productId: product.id,
        quantity,
        unit,
        ...(offerId ? { offerId } : {}),
      })
      notifyActionResult(result, t("storefront.addedToCart"))
    })
  }

  return (
    <section
      className={cn(
        "border border-[var(--sidebar-border)] bg-background",
        sticky && "lg:sticky lg:top-20 lg:self-start",
        className
      )}
      aria-label={t("storefront.orderPanel")}
    >
      <div className="border-b border-[var(--sidebar-border)] px-4 py-3.5">
        {unitPrice != null ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-semibold tabular-nums text-[var(--brand-navy)]">
              £{unitPrice.toFixed(2)}
            </p>
            {product.compareAtPrice != null ? (
              <p className="text-sm text-muted-foreground line-through tabular-nums">
                £{product.compareAtPrice.toFixed(2)}
              </p>
            ) : null}
            {product.discountPercent != null && product.discountPercent > 0 ? (
              <span className="text-xs font-semibold text-primary">
                −{product.discountPercent}%
              </span>
            ) : null}
          </div>
        ) : null}
        {unitPrice != null ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("storefront.pricePerUnit", { unit })}
          </p>
        ) : null}
      </div>

      <div className="space-y-5 px-4 py-5">
        <fieldset className="space-y-2.5">
          <FieldLegend>{t("storefront.unit")}</FieldLegend>
          <div className="flex flex-wrap" role="radiogroup" aria-label={t("storefront.unit")}>
            {options.map((option, index) => {
              const selected = unit === option
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={pending}
                  onClick={() => setUnit(option)}
                  className={cn(
                    "min-w-18 flex-1 border border-[var(--sidebar-border)] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    index > 0 && "-ml-px",
                    selected
                      ? "relative z-1 bg-[var(--brand-navy)] text-white"
                      : "bg-background text-[var(--brand-navy)] hover:bg-muted/40"
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
          <ProductQuantityControl
            key={product.id}
            value={quantity}
            onChange={setQuantity}
            disabled={pending}
          />
        </fieldset>
      </div>

      <footer className="border-t border-[var(--sidebar-border)] px-4 py-4">
        {lineTotal != null ? (
          <div className="mb-3 flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{t("storefront.total")}</span>
            <span className="font-semibold tabular-nums text-[var(--brand-navy)]">
              £{lineTotal.toFixed(2)}
            </span>
          </div>
        ) : null}
        <Button
          className="h-11 w-full rounded-[2px] btn-brand font-semibold text-white"
          disabled={pending || quantity < 1}
          onClick={add}
        >
          {pending ? t("storefront.adding") : t("storefront.addToCart")}
        </Button>
      </footer>
    </section>
  )
}
