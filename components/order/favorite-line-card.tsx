"use client"

import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"

import {
  removeFavoriteItemAction,
  updateFavoriteItemAction,
} from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
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
  const options =
    item.packagingOptions.length > 0 ? item.packagingOptions : [item.unit]

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
      if (result && "removed" in result && result.removed) {
        notifyActionResult({ success: true }, t("favourites.removed"))
      }
    })
  }

  const remove = () => {
    startTransition(async () => {
      const result = await removeFavoriteItemAction(
        businessId,
        listId,
        item.itemId
      )
      notifyActionResult(result, t("favourites.removed"))
    })
  }

  return (
    <article
      className={cn(
        "rounded-[2px] border border-[var(--sidebar-border)] bg-white p-3",
        pending && "opacity-70"
      )}
    >
      <div className="flex gap-3">
        {productHref ? (
          <Link
            href={productHref}
            className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-[#f3f4f6]"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {item.name.slice(0, 1)}
              </span>
            )}
          </Link>
        ) : (
          <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-[#f3f4f6]">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {item.name.slice(0, 1)}
              </span>
            )}
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

      <p className="mb-2 mt-3 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
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
                selected
                  ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                  : "border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)] hover:bg-muted/40"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("favourites.quantity")}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-[2px] border-[var(--sidebar-border)]"
            disabled={pending}
            aria-label={t("favourites.decreaseQty")}
            onClick={() => {
              const next = qty - 1
              setQty(Math.max(0, next))
              patch({ quantity: next })
            }}
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="min-w-[28px] text-center text-base font-semibold tabular-nums text-[var(--brand-navy)]">
            {qty}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-[2px] border-[var(--sidebar-border)]"
            disabled={pending}
            aria-label={t("favourites.increaseQty")}
            onClick={() => {
              const next = qty + 1
              setQty(next)
              patch({ quantity: next })
            }}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </article>
  )
}
