"use client"

import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import { PurchaseFields, useProductPurchase } from "@/components/cart/product-purchase"
import type { CatalogProduct } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/format"

type ProductOrderPanelProps = {
  product: CatalogProduct
  businessId: string | null
  className?: string
  sticky?: boolean
}

export function ProductOrderPanel({
  product,
  businessId,
  className,
  sticky = false,
}: ProductOrderPanelProps) {
  const t = useT()
  const { requestAddToCart, canOrder } = useAuthGate()
  const purchase = useProductPurchase(product, businessId)
  const { unit, pending, lineTotal, quantity } = purchase
  const unitPrice = product.unitPrice

  const add = () => (canOrder && businessId ? purchase.add() : requestAddToCart(product))

  return (
    <section
      className={cn(
        "border border-[var(--border-subtle)] bg-background",
        sticky && "lg:sticky lg:top-20 lg:self-start",
        className
      )}
      aria-label={t("storefront.orderPanel")}
    >
      <div className="border-b border-[var(--border-subtle)] px-4 py-3.5">
        {unitPrice != null ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="text-2xl font-semibold tabular-nums text-[var(--brand-navy)]">
              {formatMoney(unitPrice)}
            </p>
            {product.compareAtPrice != null ? (
              <p className="text-sm text-muted-foreground line-through tabular-nums">
                {formatMoney(product.compareAtPrice)}
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
        <PurchaseFields purchase={purchase} />
      </div>

      <footer className="border-t border-[var(--border-subtle)] px-4 py-4">
        {lineTotal != null ? (
          <div className="mb-3 flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{t("storefront.total")}</span>
            <span className="font-semibold tabular-nums text-[var(--brand-navy)]">
              {formatMoney(lineTotal)}
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
