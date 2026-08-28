import { apiFetch } from "@/lib/api/client"
import { mapOrder } from "@/lib/mappers"
import type { Order, OrderStatus, Pagination } from "@/lib/types"

export async function listBusinessOrders(
  businessId: string,
  params?: {
    status?: string
    page?: number
    limit?: number
    q?: string
    method?: string
    deliveryFrom?: string
    deliveryTo?: string
    orderDateFrom?: string
    orderDateTo?: string
  }
): Promise<{ orders: Order[]; pagination: Pagination }> {
  const data = await apiFetch<{
    orders: Record<string, unknown>[]
    pagination: Pagination
  }>(`/api/businesses/${businessId}/orders`, {
    searchParams: { limit: 20, ...params },
  })
  return {
    orders: (data.orders ?? []).map(mapOrder),
    pagination: data.pagination,
  }
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const data = await apiFetch<{ order: Record<string, unknown> }>(
    `/api/orders/${encodeURIComponent(orderNumber)}`
  )
  return mapOrder(data.order)
}

export async function updateOrderStatus(
  orderNumber: string,
  body: { status: OrderStatus; note?: string }
) {
  const data = await apiFetch<{ order: Record<string, unknown> }>(
    `/api/orders/${encodeURIComponent(orderNumber)}/status`,
    { method: "POST", body }
  )
  return mapOrder(data.order)
}

export async function cancelOrder(orderNumber: string, note?: string) {
  const data = await apiFetch<{ order: Record<string, unknown> }>(
    `/api/orders/${encodeURIComponent(orderNumber)}/cancel`,
    { method: "POST", body: { note } }
  )
  return mapOrder(data.order)
}

export type NextCutoff = {
  status: string
  cutoffAt: string | null
  /** Backend "{ date, time }" objesi döner — burada görüntüleme string'ine çevrilir */
  cutoffLocal: string | null
  orderForDate: string | null
  missedToday: boolean
  supplierName: string | null
}

function toDisplayString(
  value: unknown,
  fallback: string | null = null
): string | null {
  if (!value) return fallback
  if (typeof value === "string") return value
  if (typeof value === "object") {
    const row = value as Record<string, unknown>
    const parts = [row.date, row.time]
      .filter((part) => part != null && part !== "")
      .map(String)
    return parts.length ? parts.join(" ") : fallback
  }
  return String(value)
}

export async function getNextCutoff(
  businessId: string,
  method: "delivery" | "collection" = "delivery"
): Promise<NextCutoff | null> {
  try {
    const data = await apiFetch<Record<string, unknown>>(
      `/api/businesses/${businessId}/next-cutoff`,
      { searchParams: { method } }
    )
    return {
      status: String(data.status ?? ""),
      cutoffAt: toDisplayString(data.cutoffAt),
      cutoffLocal: toDisplayString(data.cutoffLocal),
      orderForDate: toDisplayString(data.orderForDate),
      missedToday: Boolean(data.missedToday),
      supplierName: (data.supplierName as string | null) ?? null,
    }
  } catch {
    return null
  }
}
