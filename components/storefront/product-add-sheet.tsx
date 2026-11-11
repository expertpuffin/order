"use client"

import { useT } from "@/components/i18n/i18n-provider"
import { ProductImage } from "@/components/brand/product-image"
import { PurchaseFields, useProductPurchase } from "@/components/cart/product-purchase"
import type { CatalogProduct } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatMoney } from "@/lib/format"
import { productMeta } from "@/lib/product"

type ProductAddSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: CatalogProduct
  businessId: string
}

export function ProductAddSheet({
  open,
  onOpenChange,
  product,
  businessId,
}: ProductAddSheetProps) {
  const t = useT()
  const purchase = useProductPurchase(product, businessId, `${product.id}:${open}`)
  const { unit, pending, lineTotal, quantity } = purchase
  const unitPrice = product.unitPrice
  const meta = productMeta(product)

  const add = () => purchase.add(() => onOpenChange(false))

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
            <ProductImage src={product.imageUrl} name={product.name} alt={product.name} initials={2} className="text-2xl text-muted-foreground/50" />
          </div>

          <div className="space-y-6 px-4 py-5">
            {unitPrice != null ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t("storefront.unit")}</dt>
                <dd className="text-right font-medium tabular-nums text-[var(--brand-navy)]">
                  {formatMoney(unitPrice)} / {unit}
                </dd>
              </dl>
            ) : null}

            <PurchaseFields purchase={purchase} />
          </div>
        </div>

        <footer className="shrink-0 border-t border-[var(--sidebar-border)] bg-background px-4 py-4">
          {lineTotal != null ? (
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {t("storefront.total")}
              </span>
              <span className="text-lg font-semibold tabular-nums text-[var(--brand-navy)]">
                {formatMoney(lineTotal)}
              </span>
            </div>
          ) : null}
          <Button
            className="h-11 w-full rounded-[2px] btn-brand font-semibold text-white"
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
