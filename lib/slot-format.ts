export type FulfillmentMethod = "collection" | "delivery"

export const DELIVERY_SLOT_MINUTES = 120
export const COLLECTION_SLOT_MINUTES = 30

/** @deprecated delivery-only */
export const SLOT_DURATION_MINUTES = DELIVERY_SLOT_MINUTES

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  if (!Number.isFinite(h)) return 0
  return h * 60 + (Number.isFinite(m) ? m : 0)
}

function fromMinutes(total: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, total))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${pad(h)}:${pad(m)}`
}

export function slotIntervalMinutes(method: FulfillmentMethod): number {
  return method === "delivery" ? DELIVERY_SLOT_MINUTES : COLLECTION_SLOT_MINUTES
}

export function slotEndFromStart(
  start: string,
  method: FulfillmentMethod = "delivery"
): string {
  return fromMinutes(toMinutes(start) + slotIntervalMinutes(method))
}

/** Sipariş alanı — delivery: "07:00-09:00", collection: "07:30" */
export function slotOrderValue(
  start: string,
  method: FulfillmentMethod
): string {
  if (method === "collection") return start
  return `${start}-${slotEndFromStart(start, method)}`
}

/** UI etiketi */
export function slotDisplayLabel(
  start: string,
  method: FulfillmentMethod
): string {
  if (method === "collection") return start
  return `${start} – ${slotEndFromStart(start, method)}`
}

/** @deprecated use slotOrderValue(start, "delivery") */
export function slotRangeValue(start: string): string {
  return slotOrderValue(start, "delivery")
}

/** @deprecated use slotDisplayLabel(start, "delivery") */
export function slotRangeLabel(start: string): string {
  return slotDisplayLabel(start, "delivery")
}

export function slotStartFromValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  const [start] = trimmed.split("-")
  return start?.trim() ?? trimmed
}

export function slotMatchesStart(
  value: string,
  start: string,
  method: FulfillmentMethod
): boolean {
  return slotStartFromValue(value) === start
}
