import {
  asDate,
  asId,
  asNumber,
  DEFAULT_CURRENCY,
  unitCode,
  type ApprovalRuleCode,
  type FulfillmentMethod,
  type PaymentMode,
} from "@/lib/domain"

/** Order model, as the order pages and checkout read it. Pure: safe in client components. */

export const ORDER_STATUSES = [
  "draft",
  "submitted",
  "sent",
  "confirmed",
  "out_for_delivery",
  "ready_for_collection",
  "delivered",
  "collected",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderItem = {
  id: string
  productId: string | null
  supplierSku: string
  ordoriaCode: string | null
  quantity: number
  unit: string
  brand: string | null
  description: string
  packSize: string | null
  comment: string | null
  unitCost: number | null
  currency: string
}

export type ManagerApprovalState = "pending" | "approving" | "approved" | "rejected" | "withdrawn"

/** Restaurant-internal manager sign-off ("Yönetici izni") — not the supplier's confirmation */
export type OrderManagerApproval = {
  state: ManagerApprovalState
  version: number
  ruleCode: ApprovalRuleCode | null
  ruleLimit: number | null
  requestedByName: string | null
  decidedByName: string | null
  decidedAt: string | null
  reason: string | null
}

export type OrderPaymentStatus =
  | "none"
  | "authorized"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "released"
  | "expired"

export type Order = {
  id: string
  orderNumber: string
  businessId: string
  createdBy: string
  status: OrderStatus
  statusHistory: Array<{ status: OrderStatus; at: string; by: string | null; note: string | null }>
  fulfillmentMethod: FulfillmentMethod
  /** Paid with Ordoria ("ordoria"): one card hold for the whole order, fee included */
  payment: {
    mode: PaymentMode
    status: OrderPaymentStatus
    authorizedAmount: number
    capturedAmount: number
    refundedAmount: number
  }
  /** Goods after discounts plus delivery — what the customer owes. Null on orders placed before it was stored. */
  payableTotal: number | null
  currency: string
  customerNo: string | null
  snapshot: {
    businessName: string | null
    contactName: string | null
    contactPhone: string | null
    address: {
      line_1: string | null
      line_2: string | null
      post_town: string | null
      county: string | null
      postcode: string | null
    }
    sentBy: { name: string | null; phone: string | null; email: string | null }
  }
  deliveryTime: string | null
  orderDate: string
  requestedDeliveryDate: string
  supplier: { name: string | null }
  salesperson: { code: string | null; phone: string | null; email: string | null }
  specialNote: string | null
  items: OrderItem[]
  managerApproval: OrderManagerApproval | null
}

const CANCELLABLE: OrderStatus[] = ["draft", "submitted", "sent", "confirmed"]

/** A draft that waits for (or was refused) a manager's OK; it only moves through approval actions. */
export function isApprovalDraft(order: Pick<Order, "status" | "managerApproval">) {
  return order.status === "draft" && order.managerApproval != null
}

export function isCancellable(order: Pick<Order, "status" | "managerApproval">) {
  return !isApprovalDraft(order) && CANCELLABLE.includes(order.status)
}

/** What the customer owes. Older orders have no stored total, so their lines are summed. */
export function orderTotal(order: Order) {
  if (order.payableTotal != null) return order.payableTotal
  return order.items.reduce((sum, item) => (item.unitCost == null ? sum : sum + item.unitCost * item.quantity), 0)
}

/** Where checkout lands. The order pages read `placed` / `approval` back with readPlacedQuery. */
export function placedOrdersHref(orders: Array<{ orderNumber: string; pendingApproval: boolean }>) {
  if (orders.length === 1) {
    const [order] = orders
    return `/orders/${encodeURIComponent(order.orderNumber)}?placed=1${order.pendingApproval ? "&approval=1" : ""}`
  }
  return `/orders?placed=${orders.length}`
}

export function readPlacedQuery(params: { placed?: string; approval?: string }) {
  return { placedCount: Number(params.placed) || 0, awaitingApproval: params.approval === "1" }
}

const text = (value: unknown) => (value as string | null | undefined) ?? null

function mapOrderItem(raw: Record<string, unknown>): OrderItem {
  return {
    id: asId(raw._id ?? raw.id),
    productId: raw.product ? asId(raw.product) : null,
    supplierSku: String(raw.supplierSku ?? ""),
    ordoriaCode: text(raw.ordoriaCode),
    quantity: Number(raw.quantity ?? 0),
    unit: unitCode(raw.unit),
    brand: text(raw.brand),
    description: String(raw.description ?? ""),
    packSize: text(raw.packSize),
    comment: text(raw.comment),
    unitCost: typeof raw.unitCost === "number" ? raw.unitCost : null,
    currency: String(raw.currency ?? DEFAULT_CURRENCY),
  }
}

function mapManagerApproval(raw: unknown): OrderManagerApproval | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  if (!row.state) return null
  const rule = (row.rule ?? {}) as Record<string, unknown>
  const name = (value: unknown) =>
    value && typeof value === "object" ? text((value as Record<string, unknown>).name) : null
  return {
    state: row.state as ManagerApprovalState,
    version: Number(row.version ?? 1),
    ruleCode: (rule.code as OrderManagerApproval["ruleCode"]) ?? null,
    ruleLimit: typeof rule.limit === "number" ? rule.limit : null,
    requestedByName: name(row.requestedBy),
    decidedByName: name(row.decidedBy),
    decidedAt: row.decidedAt ? String(row.decidedAt) : null,
    reason: text(row.reason),
  }
}

export function mapOrder(raw: Record<string, unknown>): Order {
  const snapshot = (raw.snapshot ?? {}) as Record<string, unknown>
  const address = (snapshot.address ?? {}) as Record<string, unknown>
  const sentBy = (snapshot.sentBy ?? {}) as Record<string, unknown>
  const supplier = (raw.supplier ?? {}) as Record<string, unknown>
  const salesperson = (raw.salesperson ?? {}) as Record<string, unknown>
  const payment = (raw.payment ?? {}) as Record<string, unknown>
  const pricing = (raw.pricing ?? {}) as Record<string, unknown>

  return {
    id: asId(raw._id ?? raw.id),
    orderNumber: String(raw.orderNumber ?? ""),
    businessId: asId(raw.business),
    createdBy: asId(raw.createdBy),
    status: (raw.status as OrderStatus) ?? "draft",
    statusHistory: (Array.isArray(raw.statusHistory) ? raw.statusHistory : []).map((h) => {
      const row = h as Record<string, unknown>
      return {
        status: (row.status as OrderStatus) ?? "draft",
        at: asDate(row.at) ?? "",
        by: row.by ? asId(row.by) : null,
        note: text(row.note),
      }
    }),
    fulfillmentMethod: raw.fulfillmentMethod === "collection" ? "collection" : "delivery",
    payment: {
      mode: payment.mode === "ordoria" ? "ordoria" : "account",
      status: (payment.status as OrderPaymentStatus) ?? "none",
      authorizedAmount: Number(payment.authorizedAmount ?? 0),
      capturedAmount: Number(payment.capturedAmount ?? 0),
      refundedAmount: Number(payment.refundedAmount ?? 0),
    },
    payableTotal: asNumber(pricing.payableTotal),
    currency: String(pricing.currency ?? DEFAULT_CURRENCY),
    customerNo: text(raw.customerNo),
    snapshot: {
      businessName: text(snapshot.businessName),
      contactName: text(snapshot.contactName),
      contactPhone: text(snapshot.contactPhone),
      address: {
        line_1: text(address.line_1),
        line_2: text(address.line_2),
        post_town: text(address.post_town),
        county: text(address.county),
        postcode: text(address.postcode),
      },
      sentBy: {
        name: text(sentBy.name),
        phone: text(sentBy.phone),
        email: text(sentBy.email),
      },
    },
    deliveryTime: text(raw.deliveryTime),
    orderDate: asDate(raw.orderDate) ?? "",
    requestedDeliveryDate: asDate(raw.requestedDeliveryDate)?.slice(0, 10) ?? "",
    supplier: { name: text(supplier.name) },
    salesperson: {
      code: text(salesperson.code),
      phone: text(salesperson.phone),
      email: text(salesperson.email),
    },
    specialNote: text(raw.specialNote),
    managerApproval: mapManagerApproval(raw.managerApproval),
    items: Array.isArray(raw.items) ? raw.items.map((i) => mapOrderItem(i as Record<string, unknown>)) : [],
  }
}
