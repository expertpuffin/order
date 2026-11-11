/** Every URL the panel links to. Client-safe — do not import server API modules here. */

/** Products per catalogue page; the pager, the API call and the rails' "see all" links agree on it. */
export const PRODUCT_PAGE_SIZE = 24

export type StorefrontView = "offers" | "all"

/** Item codes appear lowercased in URLs and uppercased in API calls. */
export function itemCodeForUrl(raw: string) {
  return raw.trim().toLowerCase()
}

export function productPagePath(itemCode: string) {
  return `/products/${encodeURIComponent(itemCodeForUrl(itemCode))}`
}

/** The catalogue at `/`: home, a category, a search, the offers or all products, paged. */
export function storefrontHref(query: { q?: string; category?: string; view?: StorefrontView; page?: number }) {
  const params = new URLSearchParams()
  if (query.q) params.set("q", query.q)
  if (query.category) params.set("category", query.category)
  if (query.view) params.set("view", query.view)
  if (query.page && query.page > 1) params.set("page", String(query.page))
  const qs = params.toString()
  return qs ? `/?${qs}` : "/"
}

export function categoryHref(slug: string) {
  return storefrontHref({ category: slug })
}

export function orderHref(orderNumber: string) {
  return `/orders/${encodeURIComponent(orderNumber)}`
}

/** Onboarding steps, in order. */
export const ONBOARDING_PATHS = {
  start: "/onboarding",
  business: "/onboarding/business",
  pending: "/onboarding/pending",
} as const
