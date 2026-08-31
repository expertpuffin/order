/** Products without a category land here — UI shows localized "Other". */
export const UNCATEGORIZED_SLUG = "__other__"

export type FavoriteCategoryGroup<T extends { categorySlug?: string | null }> = {
  slug: string
  items: T[]
}

/**
 * Group favorite lines by categorySlug. Empty / missing → Other.
 * Sort: known catalog order, then alpha, Other last. Skip empty groups.
 */
export function groupFavoriteLinesByCategory<
  T extends { categorySlug?: string | null },
>(
  lines: T[],
  categoryOrder: string[] = []
): FavoriteCategoryGroup<T>[] {
  const map = new Map<string, T[]>()
  for (const line of lines) {
    const raw = line.categorySlug?.trim()
    const slug = raw ? raw : UNCATEGORIZED_SLUG
    const bucket = map.get(slug)
    if (bucket) bucket.push(line)
    else map.set(slug, [line])
  }

  return [...map.entries()]
    .filter(([, items]) => items.length > 0)
    .sort(([a], [b]) => {
      if (a === UNCATEGORIZED_SLUG) return 1
      if (b === UNCATEGORIZED_SLUG) return -1
      const ia = categoryOrder.indexOf(a)
      const ib = categoryOrder.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b)
    })
    .map(([slug, items]) => ({ slug, items }))
}
