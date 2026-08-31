"use client"

import { useEffect, useState, useTransition, type ReactNode } from "react"

import { addCartItemAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { ProductQuantityControl } from "@/components/storefront/product-quantity-control"
import type { CatalogProduct } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type ProductAddSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: CatalogProduct
  businessId: string
}

function FieldLegend({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  )
}

export function ProductAddSheet({
  open,
  onOpenChange,
  product,
  businessId,
}: ProductAddSheetProps) {
  const t = useT()
  const options =
    product.packagingOptions.length > 0
      ? product.packagingOptions
      : ["EACH"]
  const [unit, setUnit] = useState(options[0] ?? "EACH")
  const [quantity, setQuantity] = useState(0)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    const nextOptions =
      product.packagingOptions.length > 0
        ? product.packagingOptions
        : ["EACH"]
    setUnit(nextOptions[0] ?? "EACH")
    setQuantity(0)
  }, [open, product.id, product.packagingOptions])

  const unitPrice = product.unitPrice
  const lineTotal =
    unitPrice != null && quantity > 0 ? unitPrice * quantity : null
  const meta =
    [product.brand, product.packSize || product.sizeLabel]
      .filter(Boolean)
      .join(" · ") || product.itemCode

  const add = () => {
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
      if (result && "success" in result && result.success) {
        onOpenChange(false)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full max-w-[min(100vw,400px)] flex-col gap-0 border-l border-[var(--sidebar-border)] bg-[var(--sidebar)] p-0 sm:max-w-[400px]"
      >
        <SheetHeader className="shrink-0 border-b border-[var(--sidebar-border)] px-4 py-3.5 text-left">
          <SheetTitle className="pr-8 text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
            {product.name}
          </SheetTitle>
          {meta ? (
            <SheetDescription className="mt-1 text-left text-xs text-muted-foreground">
              {meta}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="aspect-[4/3] w-full border-b border-[var(--sidebar-border)] bg-muted/20">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground/50">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-6 px-4 py-5">
            {unitPrice != null ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t("storefront.unit")}</dt>
                <dd className="text-right font-medium tabular-nums text-[var(--brand-navy)]">
                  £{unitPrice.toFixed(2)} / {unit}
                </dd>
              </dl>
            ) : null}

            <fieldset className="space-y-2.5">
              <FieldLegend>{t("storefront.unit")}</FieldLegend>
              <div
                className="flex flex-wrap gap-0"
                role="radiogroup"
                aria-label={t("storefront.unit")}
              >
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
                        "min-w-[4.5rem] flex-1 border border-[var(--sidebar-border)] px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                        index > 0 && "-ml-px",
                        selected
                          ? "relative z-[1] bg-[var(--brand-navy)] text-white"
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
                key={`${product.id}-${open ? "open" : "closed"}`}
                value={quantity}
                onChange={setQuantity}
                disabled={pending}
              />
            </fieldset>
          </div>
        </div>

        <footer className="shrink-0 border-t border-[var(--sidebar-border)] bg-background px-4 py-4">
          {lineTotal != null ? (
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {t("storefront.total")}
              </span>
              <span className="text-lg font-semibold tabular-nums text-[var(--brand-navy)]">
                £{lineTotal.toFixed(2)}
              </span>
            </div>
          ) : null}
          <Button
            className="h-11 w-full font-semibold"
            disabled={pending || quantity < 1}
            data-state={pending ? "loading" : undefined}
            onClick={add}
          >
            {pending ? t("storefront.adding") : t("storefront.addToCart")}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  )
}
