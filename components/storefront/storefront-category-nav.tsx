"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import type { CatalogCategory } from "@/lib/api/catalog"
import { cn } from "@/lib/utils"

type StorefrontCategoryNavProps = {
  categories: CatalogCategory[]
  activeSlug?: string
  businessName: string | null
  className?: string
}

function categoryHref(slug: string) {
  return `/?category=${encodeURIComponent(slug)}`
}

export function StorefrontCategoryNav({
  categories,
  activeSlug,
  businessName,
  className,
}: StorefrontCategoryNavProps) {
  const t = useT()

  const byParent = useMemo(() => {
    const map = new Map<string | null, CatalogCategory[]>()
    for (const cat of categories) {
      if (!cat.slug) continue
      const key = cat.parentId
      const list = map.get(key) ?? []
      list.push(cat)
      map.set(key, list)
    }
    return map
  }, [categories])

  const roots = byParent.get(null) ?? []

  const activeAncestors = useMemo(() => {
    const ids = new Set<string>()
    if (!activeSlug) return ids
    const active = categories.find((c) => c.slug === activeSlug)
    if (!active) return ids
    let parentId = active.parentId
    while (parentId) {
      ids.add(parentId)
      const parent = categories.find((c) => c.id === parentId)
      parentId = parent?.parentId ?? null
    }
    ids.add(active.id)
    return ids
  }, [activeSlug, categories])

  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(activeAncestors)
  )

  useEffect(() => {
    if (activeAncestors.size === 0) return
    setOpenIds((prev) => {
      const next = new Set(prev)
      for (const id of activeAncestors) next.add(id)
      return next
    })
  }, [activeAncestors])

  const descendantSlugSet = useMemo(() => {
    const map = new Map<string, Set<string>>()
    const collect = (id: string): Set<string> => {
      const cached = map.get(id)
      if (cached) return cached
      const set = new Set<string>()
      for (const child of byParent.get(id) ?? []) {
        if (child.slug) set.add(child.slug)
        for (const s of collect(child.id)) set.add(s)
      }
      map.set(id, set)
      return set
    }
    for (const root of roots) collect(root.id)
    return map
  }, [byParent, roots])

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const rowActive = (isActive: boolean, childActive: boolean) =>
    isActive || childActive

  const renderBranch = (nodes: CatalogCategory[], depth: number) =>
    nodes.map((category) => {
      const children = byParent.get(category.id) ?? []
      const hasChildren = children.length > 0
      const isOpen = openIds.has(category.id)
      const isActive = activeSlug === category.slug
      const childActive =
        Boolean(activeSlug) &&
        (descendantSlugSet.get(category.id)?.has(activeSlug!) ?? false)
      const selected = rowActive(isActive, childActive)

      return (
        <div key={category.id} className="min-w-0">
          <div
            className={cn(
              "flex items-center gap-0.5 transition-colors",
              selected
                ? "bg-[var(--brand-navy)] font-medium text-white"
                : "text-[var(--brand-navy)] hover:bg-muted"
            )}
            style={{ paddingLeft: Math.min(depth, 3) * 10 }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggle(category.id)}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm"
              >
                {category.name}
              </button>
            ) : category.slug ? (
              <Link
                href={categoryHref(category.slug)}
                className="min-w-0 flex-1 truncate px-3 py-2 text-sm"
              >
                {category.name}
              </Link>
            ) : (
              <span className="min-w-0 flex-1 truncate px-3 py-2 text-sm">
                {category.name}
              </span>
            )}

            {hasChildren ? (
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={isOpen ? "Collapse" : "Expand"}
                onClick={() => toggle(category.id)}
                className={cn(
                  "mr-1 flex size-7 shrink-0 items-center justify-center",
                  selected
                    ? "text-white/70 hover:text-white"
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                )}
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isOpen ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>
            ) : (
              <span className="mr-1 size-7 shrink-0" aria-hidden />
            )}
          </div>

          {hasChildren && isOpen ? (
            <div className="mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] ml-3.5 pl-1">
              {category.slug ? (
                <Link
                  href={categoryHref(category.slug)}
                  className={cn(
                    "block px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-[var(--brand-navy)] font-medium text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  style={{ paddingLeft: Math.min(depth + 1, 3) * 10 + 12 }}
                >
                  {t("storefront.allInCategory", { name: category.name })}
                </Link>
              ) : null}
              {renderBranch(children, depth + 1)}
            </div>
          ) : null}
        </div>
      )
    })

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-background text-[var(--brand-navy)]",
        className
      )}
    >
      <div className="border-b border-[var(--sidebar-border)] px-4 py-3.5">
        <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("storefront.storeLabel")}
        </p>
        <p className="truncate text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
          {businessName || t("common.orderia")}
        </p>
      </div>

      <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("storefront.categories")}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <Link
          href="/"
          className={cn(
            "mb-1 flex items-center px-3 py-2 text-sm transition-colors",
            !activeSlug
              ? "bg-[var(--brand-navy)] font-medium text-white"
              : "hover:bg-muted"
          )}
        >
          {t("storefront.allProducts")}
        </Link>
        <div className="space-y-0.5">{renderBranch(roots, 0)}</div>
      </nav>
    </aside>
  )
}
