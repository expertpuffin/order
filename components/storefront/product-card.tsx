"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import { productPagePath } from "@/lib/storefront-paths"
import type { CatalogProduct } from "@/lib/api/catalog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  product: CatalogProduct
  variant?: "grid" | "rail"
}

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const t = useT()
  const { requestAddToCart } = useAuthGate()
  const unitHint = product.packagingOptions.slice(0, 3).join(" · ")
  const meta =
    [product.brand, product.packSize || product.sizeLabel]
      .filter(Boolean)
      .join(" · ") || product.itemCode

  return (
    <article
      className={cn(
        "group flex flex-col bg-white",
        variant === "grid"
          ? "overflow-hidden rounded-[2px] border border-[var(--sidebar-border)]"
          : null
      )}
    >
      <div
        className={cn(
          "relative bg-[#f3f4f6]",
          variant === "grid"
            ? "aspect-square"
            : "aspect-square overflow-hidden rounded-[2px] border border-[var(--sidebar-border)]"
        )}
      >
        <Link
          href={productPagePath(product.itemCode)}
          className="absolute inset-0 z-0"
          aria-label={product.name}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground/40">
              {product.name.slice(0, 1)}
            </div>
          )}
        </Link>
        <Button
          size="icon"
          className="absolute right-2 bottom-2 z-1 size-8 rounded-[2px] border-0 btn-brand text-white hover:opacity-90"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            requestAddToCart(product)
          }}
          aria-label={t("storefront.addToCart")}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <Link
        href={productPagePath(product.itemCode)}
        className={cn(
          "flex flex-1 flex-col gap-1 text-inherit no-underline",
          variant === "grid" ? "p-3" : "pt-2"
        )}
      >
        {product.unitPrice != null ? (
          <div className="flex flex-wrap items-baseline gap-1.5">
            <p className="text-base font-semibold tabular-nums text-[var(--brand-navy)]">
              £{product.unitPrice.toFixed(2)}
            </p>
            {product.compareAtPrice != null ? (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                £{product.compareAtPrice.toFixed(2)}
              </p>
            ) : null}
          </div>
        ) : null}

        {product.discountPercent != null && product.discountPercent > 0 ? (
          <span className="w-fit rounded-[2px] bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            %{product.discountPercent} {t("storefront.discount")}
          </span>
        ) : null}

        {unitHint ? (
          <p className="font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {unitHint}
          </p>
        ) : null}

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[var(--brand-navy)]">
          {product.name}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{meta}</p>
      </Link>
    </article>
  )
}
