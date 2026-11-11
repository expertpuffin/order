/** The orders list URL: one schema for the page, its status tabs, filter bar and pager. */

export const ORDER_FILTER_KEYS = ["q", "method", "deliveryFrom", "deliveryTo", "orderDateFrom", "orderDateTo"] as const

type FilterKey = (typeof ORDER_FILTER_KEYS)[number]

export type OrderListQuery = Record<FilterKey, string> & {
  status: string
  page: number
  /** Set by checkout (see placedOrdersHref); kept while browsing so the notice stays */
  placed: string
}

export function parseOrderListQuery(params: Partial<Record<string, string>>): OrderListQuery {
  const filters = Object.fromEntries(ORDER_FILTER_KEYS.map((key) => [key, params[key]?.trim() ?? ""])) as Record<
    FilterKey,
    string
  >
  return {
    ...filters,
    status: params.status ?? "",
    page: Math.max(1, Number(params.page) || 1),
    placed: params.placed ?? "",
  }
}

export function orderFilters(query: OrderListQuery) {
  return Object.fromEntries(ORDER_FILTER_KEYS.map((key) => [key, query[key]])) as Record<FilterKey, string>
}

export function hasOrderFilters(query: OrderListQuery) {
  return ORDER_FILTER_KEYS.some((key) => query[key])
}

/** `/orders?…` with empty values and page 1 left out. */
export function orderListHref(query: Partial<OrderListQuery>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (key === "page" && Number(value) <= 1) continue
    if (value) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `/orders?${qs}` : "/orders"
}
