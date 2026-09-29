import type {
  Order,
  OrderItem,
  OrderStatus,
  OrderUnit,
  PlatformRole,
  StaffPermission,
  BusinessStatus,
  User,
} from "@/lib/types"

export function asId(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

function asDate(value: unknown): string | null {
  if (!value) return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function personName(raw: Record<string, unknown>): string {
  if (raw.name) return String(raw.name)
  const first = String(raw.firstName ?? "").trim()
  const last = String(raw.lastName ?? "").trim()
  return [first, last].filter(Boolean).join(" ") || "—"
}

function mapStaffRoleSummary(raw: unknown): User["staffRole"] {
  if (!raw) return null
  if (typeof raw === "string") {
    return { id: raw, name: "", slug: "" }
  }
  const o = raw as Record<string, unknown>
  const id = asId(o._id ?? o.id)
  if (!id) return null
  return {
    id,
    name: String(o.name ?? ""),
    slug: String(o.slug ?? ""),
  }
}

export function mapUser(raw: Record<string, unknown>): User {
  const staffRolePop = raw.staffRole ?? raw.staffRoleId
  const staffRole = mapStaffRoleSummary(staffRolePop)
  const staffRoleId =
    typeof raw.staffRoleId === "string" || raw.staffRoleId == null
      ? raw.staffRoleId
        ? String(raw.staffRoleId)
        : staffRole?.id ?? null
      : asId(raw.staffRoleId) || staffRole?.id || null

  return {
    id: asId(raw._id ?? raw.id),
    name: personName(raw),
    email: String(raw.email ?? ""),
    phone: (raw.phone as string | null) ?? null,
    role: (raw.role as PlatformRole) ?? "user",
    staffRoleId,
    staffRole,
    permissions: Array.isArray(raw.permissions)
      ? (raw.permissions as StaffPermission[])
      : [],
    isEmailVerified: Boolean(raw.isEmailVerified),
    lastLoginAt: asDate(raw.lastLoginAt),
    isActive: raw.isActive !== false,
    googleId: (raw.googleId as string | null) ?? null,
    appleId: (raw.appleId as string | null) ?? null,
    createdAt: asDate(raw.createdAt) ?? "",
    businessId: raw.businessId ? asId(raw.businessId) : null,
    businessStatus: (raw.businessStatus as BusinessStatus) ?? null,
    businessNumber: (raw.businessNumber as string | null) ?? null,
    dateOfBirth: asDate(raw.dateOfBirth),
    occupation: (raw.occupation as string | null) ?? null,
    occupationOther: (raw.occupationOther as string | null) ?? null,
    lastBirthdayGreetingYear:
      raw.lastBirthdayGreetingYear != null
        ? Number(raw.lastBirthdayGreetingYear)
        : null,
  }
}

function mapOrderItem(raw: Record<string, unknown>): OrderItem {
  return {
    id: asId(raw._id ?? raw.id),
    type: String(raw.type ?? ""),
    productId: raw.product ? asId(raw.product) : null,
    supplierSku: String(raw.supplierSku ?? ""),
    orderiaCode: (raw.orderiaCode as string | null) ?? null,
    quantity: Number(raw.quantity ?? 0),
    unit: (raw.unit as OrderUnit) ?? "EACH",
    brand: (raw.brand as string | null) ?? null,
    description: String(raw.description ?? ""),
    unitSize: typeof raw.unitSize === "number" ? raw.unitSize : null,
    packSize: (raw.packSize as string | null) ?? null,
    comment: (raw.comment as string | null) ?? null,
    unitCost: typeof raw.unitCost === "number" ? raw.unitCost : null,
    currency: String(raw.currency ?? "GBP"),
  }
}

export function mapOrder(raw: Record<string, unknown>): Order {
  const snapshot = (raw.snapshot ?? {}) as Record<string, unknown>
  const address = (snapshot.address ?? {}) as Record<string, unknown>
  const sentBy = (snapshot.sentBy ?? {}) as Record<string, unknown>
  const supplier = (raw.supplier ?? {}) as Record<string, unknown>
  const salesperson = (raw.salesperson ?? {}) as Record<string, unknown>
  const history = Array.isArray(raw.statusHistory) ? raw.statusHistory : []

  const businessId =
    typeof raw.business === "object" && raw.business
      ? asId((raw.business as { _id?: unknown })._id)
      : asId(raw.business)

  const createdBy =
    typeof raw.createdBy === "object" && raw.createdBy
      ? asId((raw.createdBy as { _id?: unknown })._id)
      : asId(raw.createdBy)

  return {
    id: asId(raw._id ?? raw.id),
    orderNumber: String(raw.orderNumber ?? ""),
    businessId,
    createdBy,
    status: (raw.status as OrderStatus) ?? "draft",
    fulfillmentMethod:
      String(raw.fulfillmentMethod ?? "delivery") === "collection"
        ? "collection"
        : "delivery",
    statusHistory: history.map((h) => {
      const row = h as Record<string, unknown>
      return {
        status: (row.status as OrderStatus) ?? "draft",
        at: asDate(row.at) ?? "",
        by: row.by ? asId(row.by) : null,
        note: (row.note as string | null) ?? null,
      }
    }),
    paymentOption: (raw.paymentOption as string | null) ?? null,
    customerNo: (raw.customerNo as string | null) ?? null,
    snapshot: {
      businessNumber: (snapshot.businessNumber as string | null) ?? null,
      businessName: (snapshot.businessName as string | null) ?? null,
      contactName: (snapshot.contactName as string | null) ?? null,
      contactPhone: (snapshot.contactPhone as string | null) ?? null,
      address: {
        line_1: (address.line_1 as string | null) ?? null,
        line_2: (address.line_2 as string | null) ?? null,
        post_town: (address.post_town as string | null) ?? null,
        county: (address.county as string | null) ?? null,
        postcode: (address.postcode as string | null) ?? null,
      },
      openTime: (snapshot.openTime as string | null) ?? null,
      closeTime: (snapshot.closeTime as string | null) ?? null,
      sentBy: {
        name: (sentBy.name as string | null) ?? null,
        phone: (sentBy.phone as string | null) ?? null,
        email: (sentBy.email as string | null) ?? null,
      },
    },
    deliveryTime: (raw.deliveryTime as string | null) ?? null,
    orderDate: asDate(raw.orderDate) ?? "",
    requestedDeliveryDate: asDate(raw.requestedDeliveryDate)?.slice(0, 10) ?? "",
    supplier: { name: (supplier.name as string | null) ?? null },
    salesperson: {
      code: (salesperson.code as string | null) ?? null,
      phone: (salesperson.phone as string | null) ?? null,
      email: (salesperson.email as string | null) ?? null,
    },
    specialNote: (raw.specialNote as string | null) ?? null,
    items: Array.isArray(raw.items)
      ? raw.items.map((i) => mapOrderItem(i as Record<string, unknown>))
      : [],
  }
}

export function getOrderTotal(order: Order) {
  return order.items.reduce((sum, item) => {
    if (item.unitCost == null) return sum
    return sum + item.unitCost * item.quantity
  }, 0)
}
