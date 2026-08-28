export const TOUR_STORAGE_KEY = "rl_order_product_tour_v1"

export function hasCompletedTour(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "1"
  } catch {
    return true
  }
}

export function markTourCompleted(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "1")
  } catch {
    /* ignore */
  }
}

export function tourIdFromHref(href: string): string {
  return `nav-${href.replace(/^\//, "").replace(/\//g, "-")}`
}

export function resolveTourTargetId(href: string): string {
  return tourIdFromHref(href)
}

export type TourStepDef = {
  id: string
  target: string
  eyebrow: string
  title: string
  body: string
  tips: string[]
  placement?: "center" | "right" | "left" | "top" | "bottom"
}

export const ALL_TOUR_STEP_DEFS: TourStepDef[] = [
  {
    id: "welcome",
    target: "body",
    eyebrow: "Getting started",
    title: "Welcome to Ordering",
    body: "Browse suppliers, fill your cart, and track orders for the active restaurant. Skip anytime.",
    tips: ["Switch business from the sidebar", "Only shows once"],
    placement: "center",
  },
  {
    id: "nav-dashboard",
    target: '[data-tour="nav-dashboard"]',
    eyebrow: "Overview",
    title: "Dashboard",
    body: "Quick status for the restaurant you are ordering for.",
    tips: ["Confirm the correct business before ordering"],
    placement: "right",
  },
  {
    id: "nav-catalog",
    target: '[data-tour="nav-catalog"]',
    eyebrow: "Order",
    title: "Catalog",
    body: "Browse supplier offers and add products to your cart.",
    tips: ["Search and filters speed up weekly orders"],
    placement: "right",
  },
  {
    id: "nav-cart",
    target: '[data-tour="nav-cart"]',
    eyebrow: "Order",
    title: "Cart",
    body: "Review quantities and checkout by supplier group.",
    tips: ["Delivery vs collection is chosen at checkout"],
    placement: "right",
  },
  {
    id: "nav-favourites",
    target: '[data-tour="nav-favourites"]',
    eyebrow: "Order",
    title: "Favourites",
    body: "Saved products for faster reordering.",
    tips: ["Keep favourites per restaurant"],
    placement: "right",
  },
  {
    id: "nav-orders",
    target: '[data-tour="nav-orders"]',
    eyebrow: "History",
    title: "Orders",
    body: "Past and in-progress orders for this business.",
    tips: ["Reorder from history when available"],
    placement: "right",
  },
  {
    id: "header",
    target: '[data-tour="tour-header"]',
    eyebrow: "Chrome",
    title: "Top bar",
    body: "Page context and shortcuts while you shop.",
    tips: ["Stay aware of the active restaurant"],
    placement: "bottom",
  },
  {
    id: "done",
    target: "body",
    eyebrow: "You're set",
    title: "Ordering tour complete",
    body: "Catalog → Cart → checkout. Favourites and Orders keep weekly ordering fast.",
    tips: ["Start in Catalog when you are ready"],
    placement: "center",
  },
]

export function filterVisibleTourStepDefs(
  defs: TourStepDef[] = ALL_TOUR_STEP_DEFS
): TourStepDef[] {
  if (typeof document === "undefined") return defs
  return defs.filter((def) => {
    if (def.target === "body") return true
    return Boolean(document.querySelector(def.target))
  })
}
