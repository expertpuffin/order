"use client"

import Link from "next/link"
import { Check, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react"
import { useMemo, useState, useTransition } from "react"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { FavoriteLineCard } from "@/components/order/favorite-line-card"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { addAllFavoritesToCartAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import type { FavoriteItem } from "@/lib/api/favorites"
import {
  groupFavoriteLinesByCategory,
  UNCATEGORIZED_SLUG,
} from "@/lib/favorite-groups"
import { cn } from "@/lib/utils"

type FavouritesPanelProps = {
  businessId: string
  listId: string
  items: FavoriteItem[]
  businessName: string
}

export function FavouritesPanel({
  businessId,
  listId,
  items,
  businessName,
}: FavouritesPanelProps) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  const categoryTitles = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      const slug = item.categorySlug?.trim()
      if (!slug || map.has(slug)) continue
      if (item.categoryName?.trim()) map.set(slug, item.categoryName.trim())
    }
    return map
  }, [items])

  const categoryOrder = useMemo(
    () => [...new Set(items.map((i) => i.categorySlug).filter(Boolean))] as string[],
    [items]
  )

  const groups = useMemo(
    () => groupFavoriteLinesByCategory(items, categoryOrder),
    [items, categoryOrder]
  )

  const allSlugs = useMemo(() => groups.map((g) => g.slug), [groups])
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(() => new Set())

  const allExpanded =
    allSlugs.length > 0 && allSlugs.every((slug) => openSlugs.has(slug))
  const noneExpanded = openSlugs.size === 0

  const titleFor = (slug: string) => {
    if (slug === UNCATEGORIZED_SLUG) return t("favourites.other")
    return categoryTitles.get(slug) ?? slug.replaceAll("-", " ")
  }

  const toggleSection = (slug: string) => {
    setOpenSlugs((cur) => {
      const next = new Set(cur)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const addAll = (goToCart: boolean) => {
    startTransition(async () => {
      const result = await addAllFavoritesToCartAction(businessId, {
        redirectToCart: goToCart,
      })
      if (result && "error" in result) {
        notifyActionResult(result)
        return
      }
      if (result && "added" in result) {
        notifyActionResult(
          result,
          t("favourites.addedToCartMessage", {
            n: String(result.added),
            name: businessName,
          })
        )
      }
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PUFFIN_ICONS.emptyFavourites}
        eyebrow={t("favourites.sectionLabel")}
        title={t("favourites.emptyTitle")}
        body={t("favourites.emptyBody")}
        actions={
          <Button
            className="h-10 rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
            nativeButton={false}
            render={<Link href="/" />}
          >
            {t("nav.catalog")}
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={allExpanded}
          className="h-9 flex-1 rounded-[2px] border-[var(--sidebar-border)] font-mono text-xs font-semibold uppercase tracking-wide"
          onClick={() => setOpenSlugs(new Set(allSlugs))}
        >
          {t("favourites.expandAll")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={noneExpanded}
          className="h-9 flex-1 rounded-[2px] border-[var(--sidebar-border)] font-mono text-xs font-semibold uppercase tracking-wide"
          onClick={() => setOpenSlugs(new Set())}
        >
          {t("favourites.collapseAll")}
        </Button>
      </div>

      <div className="space-y-2.5">
        {groups.map((group) => {
          const open = openSlugs.has(group.slug)
          return (
            <div key={group.slug} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleSection(group.slug)}
                className="flex w-full items-center justify-between rounded-[2px] border border-[var(--sidebar-border)] bg-white px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
                aria-expanded={open}
              >
                <div className="min-w-0 pr-3">
                  <p className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
                    {titleFor(group.slug)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("favourites.productCount", {
                      n: String(group.items.length),
                    })}
                  </p>
                </div>
                {open ? (
                  <ChevronUp className="size-4 shrink-0 text-[var(--brand-navy)]" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-[var(--brand-navy)]" />
                )}
              </button>

              {open ? (
                <div className="space-y-2 pl-0 sm:pl-1">
                  {group.items.map((item) => (
                    <FavoriteLineCard
                      key={item.itemId}
                      businessId={businessId}
                      listId={listId}
                      item={item}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div
        className={cn(
          "sticky bottom-3 z-10 flex gap-2 rounded-[2px] border border-[var(--sidebar-border)] bg-white p-3 shadow-sm",
          pending && "opacity-70"
        )}
      >
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="h-11 flex-1 rounded-[2px] border-[var(--brand-orange)]/50 font-semibold text-[var(--brand-navy)]"
          onClick={() => addAll(false)}
        >
          <ShoppingCart className="size-4" />
          {t("favourites.addAll")}
        </Button>
        <Button
          type="button"
          disabled={pending}
          className="h-11 flex-1 rounded-[2px] bg-[var(--brand-orange)] font-semibold text-white hover:bg-[var(--brand-orange)]/90"
          onClick={() => addAll(true)}
        >
          <Check className="size-4" />
          {t("favourites.placeOrder")}
        </Button>
      </div>
    </div>
  )
}
