import type { TourStepDef } from "@/lib/product-tour"

const PAGE_TOUR_PREFIX = "rl_order_page_tour_v1:"

export function normalizeTourPath(pathname: string): string {
  if (!pathname) return "/"
  return pathname.replace(/\/+$/, "") || "/"
}

export function pageTourStorageKey(pathname: string): string {
  return `${PAGE_TOUR_PREFIX}${normalizeTourPath(pathname)}`
}

export function hasCompletedPageTour(pathname: string): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(pageTourStorageKey(pathname)) === "1"
  } catch {
    return true
  }
}

export function markPageTourCompleted(pathname: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(pageTourStorageKey(pathname), "1")
  } catch {
    /* ignore */
  }
}

export function resolvePageTourSteps(
  pathname: string
): TourStepDef[] | null {
  const path = normalizeTourPath(pathname)
  if (PAGE_TOURS[path]) return PAGE_TOURS[path]
  const keys = Object.keys(PAGE_TOURS).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (path === key || path.startsWith(`${key}/`)) return PAGE_TOURS[key]
  }
  return null
}

export const PAGE_TOURS: Record<string, TourStepDef[]> = {
  "/dashboard": [
    {
      id: "page-dashboard-header",
      target: '[data-tour="page-dashboard-header"]',
      eyebrow: "Ordering",
      title: "Order dashboard",
      body: "Status for the restaurant you are ordering for right now.",
      tips: ["Confirm the active business in the sidebar"],
      placement: "bottom",
    },
    {
      id: "page-dashboard-metrics",
      target: '[data-tour="page-dashboard-metrics"]',
      eyebrow: "Ordering",
      title: "Insights",
      body: "Quick signals before you open the catalog.",
      tips: ["Head to Catalog to place an order"],
      placement: "bottom",
    },
  ],
  "/catalog": [
    {
      id: "page-catalog-header",
      target: '[data-tour="page-catalog-header"]',
      eyebrow: "Catalog",
      title: "Browse products",
      body: "Supplier offers available to this restaurant — search and add to cart.",
      tips: ["Filters help weekly reorders"],
      placement: "bottom",
    },
    {
      id: "page-catalog-grid",
      target: '[data-tour="page-catalog-grid"]',
      eyebrow: "Catalog",
      title: "Product grid",
      body: "Tap a product to set quantity and packaging, then add to cart.",
      tips: ["Favourites speed up repeats"],
      placement: "top",
    },
  ],
  "/cart": [
    {
      id: "page-cart-header",
      target: '[data-tour="page-cart-header"]',
      eyebrow: "Cart",
      title: "Your cart",
      body: "Review lines by supplier group before checkout.",
      tips: ["Delivery vs collection is chosen at checkout"],
      placement: "bottom",
    },
    {
      id: "page-cart-lines",
      target: '[data-tour="page-cart-lines"]',
      eyebrow: "Cart",
      title: "Line items",
      body: "Adjust quantities or remove products here.",
      tips: [],
      placement: "top",
    },
    {
      id: "page-cart-checkout",
      target: '[data-tour="page-cart-checkout"]',
      eyebrow: "Cart",
      title: "Checkout",
      body: "Pick fulfilment method, day, and time — then place the order.",
      tips: ["Closed days may be blocked unless you are a Specific customer"],
      placement: "top",
    },
  ],
  "/favourites": [
    {
      id: "page-favourites-header",
      target: '[data-tour="page-favourites-header"]',
      eyebrow: "Favourites",
      title: "Saved products",
      body: "Quick re-add of products you order often.",
      tips: ["Favourites are per restaurant"],
      placement: "bottom",
    },
    {
      id: "page-favourites-table",
      target: '[data-tour="page-favourites-table"]',
      eyebrow: "Favourites",
      title: "List",
      body: "Add favourites to the cart in one click.",
      tips: [],
      placement: "top",
    },
  ],
  "/orders": [
    {
      id: "page-orders-header",
      target: '[data-tour="page-orders-header"]',
      eyebrow: "Orders",
      title: "Order history",
      body: "Past and in-progress orders for this business.",
      tips: ["Open an order for status and lines"],
      placement: "bottom",
    },
    {
      id: "page-orders-table",
      target: '[data-tour="page-orders-table"]',
      eyebrow: "Orders",
      title: "Orders table",
      body: "Browse and filter your restaurant orders.",
      tips: ["Reorder from history when available"],
      placement: "top",
    },
  ],
}
