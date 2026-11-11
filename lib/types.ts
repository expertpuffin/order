export type BusinessStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"

export const BUSINESS_TYPES = [
  "Canteen",
  "Cafe",
  "Cafe Bistro / Lounge",
  "Pizzeria",
  "Fish & Chips",
  "Fried Chicken",
  "Kebab",
  "Takeaway",
  "Restaurant",
  "Wholesaler",
  "Catering",
  "Off-Licence",
  "Supermarket",
  "Other",
] as const

export const TEAM_PERMISSIONS = [
  "orders",
  "orders_approve",
  "inventory",
  "billing",
  "team",
  "settings",
] as const

export type TeamPermission = (typeof TEAM_PERMISSIONS)[number]

export const ORDER_STATUSES = [
  "draft",
  "submitted",
  "sent",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const

export const ORDER_UNITS = ["BOX", "EACH", "KG", "PACK", "POSET"] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type OrderUnit = (typeof ORDER_UNITS)[number]

export type OrderItem = {
  id: string
  type: string
  productId: string | null
  supplierSku: string
  ordoriaCode: string | null
  quantity: number
  unit: OrderUnit
  brand: string | null
  description: string
  unitSize: number | null
  packSize: string | null
  comment: string | null
  unitCost: number | null
  currency: string
}

export type OrderStatusHistory = {
  status: OrderStatus
  at: string
  by: string | null
  note: string | null
}

export type Order = {
  id: string
  orderNumber: string
  businessId: string
  createdBy: string
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  fulfillmentMethod: "delivery" | "collection"
  paymentOption: string | null
  /** Paid with Ordoria ("ordoria"): one card hold for the whole order, fee included */
  payment: {
    mode: "account" | "ordoria"
    status: "none" | "authorized" | "paid" | "partially_refunded" | "refunded" | "released" | "expired"
    authorizedAmount: number
    capturedAmount: number
    refundedAmount: number
  }
  customerNo: string | null
  snapshot: {
    businessNumber: string | null
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
    openTime: string | null
    closeTime: string | null
    sentBy: {
      name: string | null
      phone: string | null
      email: string | null
    }
  }
  deliveryTime: string | null
  orderDate: string
  requestedDeliveryDate: string
  supplier: {
    name: string | null
  }
  salesperson: {
    code: string | null
    phone: string | null
    email: string | null
  }
  specialNote: string | null
  items: OrderItem[]
  /** Restaurant-internal manager sign-off ("Yönetici izni") — not the supplier's confirmation */
  managerApproval: OrderManagerApproval | null
}

export type ManagerApprovalState = "pending" | "approving" | "approved" | "rejected" | "withdrawn"

export type OrderManagerApproval = {
  state: ManagerApprovalState
  version: number
  ruleCode: "role" | "member" | "amount" | null
  ruleLimit: number | null
  requestedByName: string | null
  decidedByName: string | null
  decidedAt: string | null
  reason: string | null
}

export const PLATFORM_ROLES = ["user", "admin", "master", "supplier"] as const

export type PlatformRole = (typeof PLATFORM_ROLES)[number]

/** Ordoria Business Admin Panel staff permissions */
export const STAFF_PERMISSIONS = [
  "dashboard.read",
  "businesses.read",
  "businesses.manage",
  "products.read",
  "products.manage",
  "suppliers.read",
  "suppliers.manage",
  "categories.manage",
  "orders.read",
  "orders.manage",
  "app_cms.manage",
  "site_cms.manage",
  "users.read",
  "users.manage",
  "staff_roles.manage",
  "team_roles.manage",
  "platform_roles.read",
  "notifications.read",
  "notifications.send",
  "feedback.read",
  "feedback.manage",
  "crashes.read",
  "crashes.manage",
  "uploads.manage",
  "gallery.read",
  "gallery.manage",
  "audit_logs.read",
] as const

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number]

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: PlatformRole
  staffRoleId: string | null
  staffRole: { id: string; name: string; slug: string } | null
  permissions: StaffPermission[]
  isEmailVerified: boolean
  lastLoginAt: string | null
  isActive: boolean
  googleId: string | null
  appleId: string | null
  createdAt: string
  businessId?: string | null
  businessStatus?: BusinessStatus | null
  businessNumber?: string | null
  dateOfBirth?: string | null
  occupation?: string | null
  occupationOther?: string | null
  lastBirthdayGreetingYear?: number | null
}

export type Pagination = {
  page: number
  limit: number
  total: number
  pages: number
  /** When set, response spans multiple logical pages in one list */
  pageFrom?: number
  pageTo?: number
  range?: boolean
}
