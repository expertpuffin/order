import { apiFetch } from "@/lib/api/client"
import { mapOrder, type Order } from "@/lib/order"
import { orderFilters, type OrderListQuery } from "@/lib/order-list-query"
import type { Pagination } from "@/lib/pagination"

const ORDERS_PAGE_SIZE = 20

/** One page of the business's orders for the list's query (empty filters are left out by apiFetch). */
export async function listBusinessOrders(
  businessId: string,
  query: OrderListQuery
): Promise<{ orders: Order[]; pagination: Pagination }> {
  const data = await apiFetch<{ orders: Record<string, unknown>[]; pagination: Pagination }>(
    `/api/businesses/${businessId}/orders`,
    { searchParams: { ...orderFilters(query), status: query.status, page: query.page, limit: ORDERS_PAGE_SIZE } }
  )
  return { orders: (data.orders ?? []).map(mapOrder), pagination: data.pagination }
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const data = await apiFetch<{ order: Record<string, unknown> }>(`/api/orders/${encodeURIComponent(orderNumber)}`)
  return mapOrder(data.order)
}

export async function cancelOrder(orderNumber: string, note?: string) {
  await apiFetch(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`, { method: "POST", body: { note } })
}

export type ApprovalCheck = {
  enabled: boolean
  required: boolean
  rule: { code: "role" | "member" | "amount"; limit: number | null; amount: number } | null
  canApprove: boolean
}

/**
 * Will this person's order (of this goods total) need a manager's OK first?
 * Advisory only — the backend decides again at checkout, so a failed check shows no notice.
 */
export async function checkOrderApproval(businessId: string, amount: number): Promise<ApprovalCheck | null> {
  try {
    return await apiFetch<ApprovalCheck>(`/api/businesses/${businessId}/order-approval/check`, {
      searchParams: { amount },
    })
  } catch {
    return null
  }
}

export async function withdrawApproval(orderNumber: string, version: number) {
  await apiFetch(`/api/orders/${encodeURIComponent(orderNumber)}/approval/withdraw`, {
    method: "POST",
    body: { version },
  })
}

export async function approvalToCart(orderNumber: string) {
  return apiFetch<{ lineCount: number; supplierId: string }>(
    `/api/orders/${encodeURIComponent(orderNumber)}/approval/to-cart`,
    { method: "POST" }
  )
}
