"use client"

import { useState, useTransition } from "react"
import { Minus, Plus } from "lucide-react"

import { addCartItemAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import type { CatalogProduct } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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
  const options =
    product.packagingOptions.length > 0
      ? product.packagingOptions
      : ["EACH"]
  const [unit, setUnit] = useState(options[0] ?? "EACH")
  const [quantity, setQuantity] = useState(1)
  const [pending, startTransition] = useTransition()

  const add = () => {
    startTransition(async () => {
      const offerId = product.offerIdsByUnit[unit.toUpperCase()]
      const result = await addCartItemAction(businessId, {
        productId: product.id,
        quantity: Math.max(1, quantity),
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
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="pr-8 text-left">{product.name}</SheetTitle>
          <SheetDescription className="text-left">
            {[product.brand, product.packSize || product.sizeLabel]
              .filter(Boolean)
              .join(" · ") || product.itemCode}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 px-4">
          <div className="mx-auto flex size-40 items-center justify-center overflow-hidden rounded-2xl border bg-muted/40">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-3xl font-semibold text-muted-foreground">
                {product.name.slice(0, 1)}
              </span>
            )}
          </div>

          {product.unitPrice != null ? (
            <p className="text-center text-xl font-semibold tabular-nums text-[var(--brand-navy)]">
              £{product.unitPrice.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {unit}
              </span>
            </p>
          ) : null}

          <div className="space-y-2">
            <Label>{t("storefront.unit")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUnit(option)}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors",
                    unit === option
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">{t("storefront.quantity")}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 rounded-xl"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <Input
                id="qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value) || 1))
                }
                className="h-10 text-center text-base font-semibold tabular-nums"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 rounded-xl"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t p-4">
          <Button
            className="h-12 w-full rounded-xl text-base font-semibold"
            disabled={pending}
            onClick={add}
          >
            {pending ? t("storefront.adding") : t("storefront.addToCart")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
