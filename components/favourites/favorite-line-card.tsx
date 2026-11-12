"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useState, useTransition } from "react"

import { removeFavoriteItemAction, restoreFavoriteItemAction, updateFavoriteItemAction } from "@/lib/actions/favourites"
import { ProductImage } from "@/components/brand/product-image"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { choiceClass } from "@/components/brand/choice"
import { cn } from "@/lib/utils"
import { productPagePath } from "@/lib/storefront-paths"
import type { FavoriteItem } from "@/lib/api/favorites"

type FavoriteLineCardProps = {
  businessId: string
  listId: string
  item: FavoriteItem
}

export function FavoriteLineCard({
  businessId,
  listId,
  item,
}: FavoriteLineCardProps) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [qty, setQty] = useState(item.quantity)
  const [unit, setUnit] = useState(item.unit)
  const options = item.packagingOptions

  const productHref = item.itemCode ? productPagePath(item.itemCode) : null

  const patch = (next: { quantity?: number; unit?: string }) => {
    startTransition(async () => {
      const result = await updateFavoriteItemAction(
        businessId,
        listId,
        item.itemId,
        next
      )
      if (result && "error" in result) {
        notifyActionResult(result)
        setQty(item.quantity)
        setUnit(item.unit)
        return
      }
    })
  }

  const remove = () => {
    startTransition(async () => {
      const result = await removeFavoriteItemAction(businessId, listId, item.itemId)
      if ("error" in result) {
        notifyActionResult(result)
        return
      }
      toast.success(t("favourites.removed"), {
        action: {
          label: t("common.undo"),
          onClick: () =>
            startTransition(async () => {
              notifyActionResult(
                await restoreFavoriteItemAction(businessId, listId, { productId: item.productId, quantity: qty, unit }),
                t("storefront.restored")
              )
            }),
        },
      })
    })
  }

  return (
    <article
      className={cn(
        "rounded-[2px] border border-[var(--border-subtle)] bg-white p-3",
        pending && "opacity-70"
      )}
    >
      <div className="flex gap-3">
        {productHref ? (
          <Link href={productHref} className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-[var(--tile)]">
            <ProductImage src={item.imageUrl} name={item.name} className="text-sm" />
          </Link>
        ) : (
          <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-[var(--tile)]">
            <ProductImage src={item.imageUrl} name={item.name} className="text-sm" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {item.itemCode ? (
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {item.itemCode}
            </p>
          ) : null}
          {item.brand ? (
            <p className="text-sm font-semibold text-[var(--brand-navy)]">
              {item.brand}
            </p>
          ) : null}
          {productHref ? (
            <Link
              href={productHref}
              className="line-clamp-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {item.name}
            </Link>
          ) : (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.name}
            </p>
          )}
          {item.packSize ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.packSize}</p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 rounded-[2px] text-red-700 hover:bg-red-50 hover:text-red-800"
          disabled={pending}
          onClick={remove}
          aria-label={t("favourites.removeFromList")}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <p className="mb-2 mt-3 eyebrow">
        {t("favourites.packaging")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = unit === opt
          return (
            <button
              key={opt}
              type="button"
              disabled={pending}
              onClick={() => {
                if (opt === unit) return
                setUnit(opt)
                patch({ unit: opt })
              }}
              className={cn(
                "rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide transition-colors",
                choiceClass(selected)
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="eyebrow">
          {t("favourites.quantity")}
        </p>
        <QuantityStepper
          value={qty}
          label={item.name}
          disabled={pending}
          onChange={(next) => {
            setQty(next)
            patch({ quantity: next })
          }}
          onRemove={remove}
        />
      </div>
    </article>
  )
}
