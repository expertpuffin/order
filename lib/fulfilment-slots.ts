import type { FulfillmentMethod } from "@/lib/domain"
import { intlLocale, type Locale } from "@/lib/i18n/config"

/**
 * Delivery and collection slots, as the backend and the mobile app (checkoutSlots)
 * count them: delivery in 2-hour windows ("07:00-09:00"), collection at 30-minute
 * times ("07:30"). Days and hours are London time.
 */

const SLOT_MINUTES: Record<FulfillmentMethod, number> = { delivery: 120, collection: 30 }

/** How far ahead orders can be placed, in days. */
export const ORDER_HORIZON_DAYS = 14

/** Opening hours assumed when a business hasn't set its own. */
export const DEFAULT_HOURS = { open: "09:00", close: "22:00" }
/** The fallback window when the business's opening hours are unknown or unreadable. */
const FALLBACK_HOURS = { open: 6, close: 22 }

/** Collection can't be booked closer than this to now. */
const COLLECTION_LEAD_MINUTES = 60

/** Delivery windows a business can choose as its usual one, and the default. */
export const USUAL_DELIVERY_WINDOWS = ["07:00", "09:00", "11:00", "13:00", "15:00"].map((start) =>
  slotOrderValue(start, "delivery")
)
export const DEFAULT_DELIVERY_WINDOW = slotOrderValue("11:00", "delivery")

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
  return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`
}

/** The value sent with the order — delivery: "07:00-09:00", collection: "07:30" */
export function slotOrderValue(start: string, method: FulfillmentMethod): string {
  if (method === "collection") return start
  return `${start}-${fromMinutes(toMinutes(start) + SLOT_MINUTES.delivery)}`
}

export function slotDisplayLabel(start: string, method: FulfillmentMethod): string {
  return slotOrderValue(start, method).replace("-", " – ")
}

/** "07:00-09:00" → "07:00" */
export function slotStartFromValue(value: string): string {
  return value.trim().split("-")[0]?.trim() ?? ""
}

export function isMorningSlot(start: string) {
  const hour = Number(start.split(":")[0])
  return Number.isFinite(hour) && hour < 12
}

function londonYmd(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

function addDaysYmd(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/** The next `ORDER_HORIZON_DAYS` days an order can be for: delivery starts tomorrow, collection today. */
export function upcomingFulfillmentDays(method: FulfillmentMethod, now = new Date()): string[] {
  const first = addDaysYmd(londonYmd(now), method === "delivery" ? 1 : 0)
  return Array.from({ length: ORDER_HORIZON_DAYS }, (_, i) => addDaysYmd(first, i))
}

function parseHour(time: string | null | undefined, fallback: number): number {
  const match = time?.match(/(\d{1,2})/)
  if (!match) return fallback
  return Math.min(23, Math.max(0, Number(match[1])))
}

/**
 * Slot starts inside the business's opening hours, for a cart with no supplier to
 * ask yet. Today's collection slots start an hour from now.
 */
export function slotsFromBusinessHours(
  dayIso: string,
  method: FulfillmentMethod,
  openTime?: string | null,
  closeTime?: string | null,
  now = new Date()
): string[] {
  const step = SLOT_MINUTES[method]
  const open = parseHour(openTime, FALLBACK_HOURS.open) * 60
  const close = Math.max(open + step, parseHour(closeTime, FALLBACK_HOURS.close) * 60)
  const earliest =
    dayIso === londonYmd(now)
      ? now.getHours() * 60 + now.getMinutes() + (method === "collection" ? COLLECTION_LEAD_MINUTES : 0)
      : 0

  const starts: string[] = []
  for (let t = open; t + step <= close; t += step) {
    if (t >= earliest) starts.push(fromMinutes(t))
  }
  return starts
}

export function formatDayCard(iso: string, locale: Locale) {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) {
    return { weekday: iso, weekdayShort: iso, dayMonth: iso, compact: iso }
  }
  const loc = intlLocale(locale)
  return {
    weekday: d.toLocaleDateString(loc, { weekday: "long" }),
    weekdayShort: d.toLocaleDateString(loc, { weekday: "short" }),
    dayMonth: d.toLocaleDateString(loc, { day: "numeric", month: "short" }),
    compact: d.toLocaleDateString(loc, { weekday: "short", day: "numeric", month: "short" }),
  }
}
