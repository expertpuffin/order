/** Mobil checkoutSlots ile uyumlu — teslimat günü / method-aware fallback */

import {
  COLLECTION_SLOT_MINUTES,
  DELIVERY_SLOT_MINUTES,
  type FulfillmentMethod,
} from "@/lib/slot-format"

export type TimeSlot = {
  value: string
  hour: number
  minute: number
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function formatSlot(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`
}

function parseHour(time: string | null | undefined, fallback: number): number {
  if (!time) return fallback
  const match = time.match(/(\d{1,2})/)
  if (!match) return fallback
  const h = Number(match[1])
  return Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : fallback
}

function fromMinutes(total: number): TimeSlot {
  const h = Math.floor(total / 60)
  const m = total % 60
  return { value: formatSlot(h, m), hour: h, minute: m }
}

export function buildDaySlots(
  method: FulfillmentMethod,
  openHour = 6,
  closeHour = 22
): TimeSlot[] {
  const openM = openHour * 60
  const closeM = closeHour * 60

  if (method === "delivery") {
    const step = DELIVERY_SLOT_MINUTES
    const slots: TimeSlot[] = []
    for (let t = openM; t + step <= closeM; t += step) {
      slots.push(fromMinutes(t))
    }
    return slots
  }

  const step = COLLECTION_SLOT_MINUTES
  const slots: TimeSlot[] = []
  for (let t = openM; t + step <= closeM; t += step) {
    slots.push(fromMinutes(t))
  }
  return slots
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

export function availableSlotsForDay(opts: {
  dayIso: string
  method: FulfillmentMethod
  now?: Date
  openHour?: number
  closeHour?: number
}): TimeSlot[] {
  const now = opts.now ?? new Date()
  const all = buildDaySlots(
    opts.method,
    opts.openHour ?? 6,
    opts.closeHour ?? 22
  )
  const todayIso = londonYmd(now)

  if (opts.dayIso !== todayIso) {
    return all
  }

  const leadMs = opts.method === "collection" ? 60 * 60 * 1000 : 0
  const earliest = new Date(now.getTime() + leadMs)
  const earliestMinutes = earliest.getHours() * 60 + earliest.getMinutes()

  return all.filter((s) => s.hour * 60 + s.minute >= earliestMinutes)
}

function addDaysYmd(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

export function upcomingFulfillmentDays(
  count = 14,
  opts?: {
    method?: FulfillmentMethod
    deliveryCutoffMissed?: boolean
    now?: Date
  }
): string[] {
  const days: string[] = []
  const now = opts?.now ?? new Date()
  const today = londonYmd(now)
  let start = today
  if (opts?.method === "delivery") {
    start = addDaysYmd(today, 1)
    if (opts.deliveryCutoffMissed) {
      start = addDaysYmd(today, 2)
    }
  }
  const [y, m, day] = start.split("-").map(Number)
  const cursor = new Date(Date.UTC(y, m - 1, day, 12, 0, 0))
  while (days.length < count) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

export function slotsFromBusinessHours(
  dayIso: string,
  method: FulfillmentMethod,
  openTime?: string | null,
  closeTime?: string | null
): string[] {
  const openHour = parseHour(openTime, 6)
  const minSpan = method === "delivery" ? 2 : 0.5
  const closeHour = Math.max(
    openHour + minSpan,
    parseHour(closeTime, 22)
  )
  return availableSlotsForDay({
    dayIso,
    method,
    openHour,
    closeHour,
  }).map((s) => s.value)
}

export function formatDayCard(iso: string, locale: string) {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) {
    return { weekday: iso, weekdayShort: iso, dayMonth: iso, compact: iso }
  }
  const loc = locale.startsWith("tr") ? "tr-TR" : "en-GB"
  return {
    weekday: d.toLocaleDateString(loc, { weekday: "long" }),
    weekdayShort: d.toLocaleDateString(loc, { weekday: "short" }),
    dayMonth: d.toLocaleDateString(loc, { day: "numeric", month: "short" }),
    compact: d.toLocaleDateString(loc, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  }
}

export function isMorningSlot(value: string) {
  const hour = Number(value.split(":")[0])
  return Number.isFinite(hour) && hour < 12
}
