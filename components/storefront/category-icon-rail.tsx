"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronRight, Percent } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import type { CatalogCategory } from "@/lib/api/catalog"
import { resolveCategoryVisual } from "@/lib/category-visuals"
import { cn } from "@/lib/utils"

type CategoryIconRailProps = {
  categories: CatalogCategory[]
  activeSlug?: string
  activeView?: "offers" | "all"
}

export function CategoryIconRail({
  categories,
  activeSlug,
  activeView,
}: CategoryIconRailProps) {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const roots = categories.filter((c) => c.depth === 0 && c.slug)

  return (
    <div className="relative">
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {t("storefront.categories")}
      </p>
      <div
        ref={ref}
        className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/?view=offers"
          className="flex w-[84px] shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              "flex size-[72px] items-center justify-center overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-[#FFF4E8]",
              activeView === "offers" &&
                "border-[var(--brand-navy)] bg-[var(--brand-navy)] ring-1 ring-[var(--brand-navy)]"
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
              <Percent className="size-5 stroke-[2.5]" />
            </div>
          </div>
          <span className="line-clamp-2 text-center text-[11px] font-medium text-[var(--brand-navy)]">
            {t("storefront.offers")}
          </span>
        </Link>

        {roots.map((cat, index) => {
          const active = activeSlug === cat.slug
          const visual = resolveCategoryVisual({ ...cat, index })
          return (
            <Link
              key={cat.id}
              href={`/?category=${encodeURIComponent(cat.slug!)}`}
              className="flex w-[84px] shrink-0 flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  "relative size-[72px] overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-white",
                  active &&
                    "border-[var(--brand-navy)] ring-1 ring-[var(--brand-navy)]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visual.imageUri}
                  alt={cat.name}
                  className="size-full object-cover"
                />
              </div>
              <span className="line-clamp-2 text-center text-[11px] font-medium text-[var(--brand-navy)]">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>

      {roots.length > 4 ? (
        <button
          type="button"
          onClick={() =>
            ref.current?.scrollBy({ left: 280, behavior: "smooth" })
          }
          className="absolute top-[46px] right-0 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-[2px] border border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)]"
          aria-label="Scroll categories"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
