"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { ProductCard } from "@/components/storefront/product-card"
import type { CatalogProduct } from "@/lib/api/catalog"

type ProductRailProps = {
  title: string
  seeAllHref: string
  seeAllLabel: string
  products: CatalogProduct[]
}

export function ProductRail({
  title,
  seeAllHref,
  seeAllLabel,
  products,
}: ProductRailProps) {
  const ref = useRef<HTMLDivElement>(null)
  if (products.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 border-b border-[var(--sidebar-border)] pb-2">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
          {title}
        </h2>
        <Link
          href={seeAllHref}
          className="shrink-0 text-xs font-semibold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
        >
          {seeAllLabel}
        </Link>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[158px] shrink-0 sm:w-[176px]">
              <ProductCard product={product} variant="rail" />
            </div>
          ))}
        </div>

        {products.length > 3 ? (
          <button
            type="button"
            onClick={() =>
              ref.current?.scrollBy({ left: 320, behavior: "smooth" })
            }
            className="absolute top-1/3 right-1 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-[2px] border border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)]"
            aria-label="Scroll products"
          >
            <ChevronRight className="size-4" />
          </button>
        ) : null}
      </div>
    </section>
  )
}
