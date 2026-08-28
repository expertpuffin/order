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
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/?view=offers"
          className="flex w-[92px] shrink-0 flex-col items-center gap-2"
        >
          <div
            className={cn(
              "flex size-[76px] items-center justify-center overflow-hidden rounded-2xl border shadow-sm",
              activeView === "offers"
                ? "ring-2 ring-primary ring-offset-2"
                : null
            )}
            style={{ backgroundColor: "#FFF4E8" }}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Percent className="size-6 stroke-[2.5]" />
            </div>
          </div>
          <span
            className={cn(
              "line-clamp-2 text-center text-xs font-semibold",
              activeView === "offers" ? "text-primary" : "text-[var(--brand-navy)]"
            )}
          >
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
              className="flex w-[92px] shrink-0 flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "relative size-[76px] overflow-hidden rounded-2xl border bg-white shadow-sm",
                  active && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={visual.imageUri}
                  alt={cat.name}
                  className="size-full object-cover"
                />
              </div>
              <span
                className={cn(
                  "line-clamp-2 text-center text-xs font-semibold",
                  active ? "text-primary" : "text-[var(--brand-navy)]"
                )}
              >
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
          className="absolute top-[38px] right-0 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow"
          aria-label="Scroll categories"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
