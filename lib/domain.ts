/** Vocabulary shared by every resource module. Changes only when the backend's does. */

export type FulfillmentMethod = "delivery" | "collection"

/** How the goods are paid: on the supplier's account, or by card through Ordoria. */
export type PaymentMode = "account" | "ordoria"

export type BusinessStatus = "pending" | "approved" | "rejected" | "suspended"

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

/** Machine codes the backend attaches to errors that the UI acts on. */
export const ERROR_CODES = {
  /** The bank wants a 3D Secure step before the order hold goes through */
  paymentActionRequired: "PAYMENT_ACTION_REQUIRED",
  /** The supplier account is closed for credit; card payment may still be possible */
  creditHold: "CREDIT_HOLD",
  /** Someone else acted on a manager approval in the meantime */
  approvalChanged: "APPROVAL_CHANGED",
} as const

/** Mongo ids arrive as strings, ObjectIds or populated documents. */
export function asId(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && "_id" in value) return String((value as { _id: unknown })._id)
  return String(value)
}

export function asDate(value: unknown): string | null {
  if (!value) return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Packaging / sales unit code as the backend compares it ("EACH", "BOX", …). */
export function unitCode(value: unknown): string {
  return String(value ?? "EACH").toUpperCase()
}

/** The offer a supplier would fill first: active, lowest priority number. */
export function preferredOffer<T extends Record<string, unknown>>(offers: T[]): T | null {
  return (
    offers
      .filter((offer) => (offer.status ?? "active") === "active")
      .sort((a, b) => Number(a.priority ?? 999) - Number(b.priority ?? 999))[0] ?? null
  )
}
