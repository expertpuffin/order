"use client"

import { useEffect, useMemo, useState } from "react"

import { loadSupplierAvailability, loadSupplierSlots } from "@/lib/actions/checkout"
import type { FulfillmentMethod } from "@/lib/domain"
import {
  ORDER_HORIZON_DAYS,
  slotOrderValue,
  slotsFromBusinessHours,
  slotStartFromValue,
  upcomingFulfillmentDays,
} from "@/lib/fulfilment-slots"

/** What the supplier said about the chosen day's slots. */
export type SlotsStatus = "loading" | "ready" | "none" | "failed"

/**
 * Days and time slots a supplier can deliver (or have collected) on. The supplier's
 * answer is final: "no slots" stays no slots. Only a cart with no supplier yet falls
 * back to the business's opening hours.
 */
export function useFulfilmentSchedule({
  businessId,
  supplierId,
  method,
  postcode,
  openTime,
  closeTime,
  defaultDeliveryTime,
}: {
  businessId: string
  supplierId: string | null
  method: FulfillmentMethod
  postcode?: string | null
  openTime?: string | null
  closeTime?: string | null
  defaultDeliveryTime: string | null
}) {
  const area = method === "delivery" ? postcode : undefined
  const candidateDays = useMemo(() => upcomingFulfillmentDays(method), [method])

  // Days: the supplier's calendar narrows the candidates; if it can't be read, the
  // slot request for the chosen day still has the last word.
  const [availability, setAvailability] = useState<{ key: string; days: Set<string> | null } | null>(null)
  const daysKey = `${supplierId}|${method}|${area}|${candidateDays[0]}`
  useEffect(() => {
    if (!supplierId) return
    let cancelled = false
    void loadSupplierAvailability(supplierId, method, { from: candidateDays[0], days: ORDER_HORIZON_DAYS, postcode: area, businessId })
      .then((res) => new Set((res.days ?? []).filter((d) => d.available).map((d) => d.date)))
      .catch(() => null)
      .then((days) => {
        if (!cancelled) setAvailability({ key: daysKey, days })
      })
    return () => {
      cancelled = true
    }
  }, [supplierId, method, area, candidateDays, businessId, daysKey])

  const daysLoading = Boolean(supplierId) && availability?.key !== daysKey
  const availableDays = supplierId && availability?.key === daysKey ? availability.days : null
  const dayOptions = availableDays ? candidateDays.filter((d) => availableDays.has(d)) : candidateDays

  const [chosenDate, setDeliveryDate] = useState("")
  const deliveryDate = dayOptions.includes(chosenDate) ? chosenDate : (dayOptions[0] ?? "")

  // Slots for the chosen day
  const [slots, setSlots] = useState<{ key: string; status: SlotsStatus; starts: string[] } | null>(null)
  const slotsKey = `${supplierId}|${method}|${area}|${deliveryDate}`
  useEffect(() => {
    if (!supplierId || !deliveryDate) return
    let cancelled = false
    void loadSupplierSlots(supplierId, method, deliveryDate, { postcode: area, businessId })
      .then((res) =>
        res.available && res.slots.length
          ? { status: "ready" as const, starts: res.slots }
          : { status: "none" as const, starts: [] }
      )
      .catch(() => ({ status: "failed" as const, starts: [] }))
      .then((result) => {
        if (!cancelled) setSlots({ key: slotsKey, ...result })
      })
    return () => {
      cancelled = true
    }
  }, [supplierId, method, area, deliveryDate, businessId, slotsKey])

  const hoursSlots = useMemo(
    () => (deliveryDate ? slotsFromBusinessHours(deliveryDate, method, openTime, closeTime) : []),
    [deliveryDate, method, openTime, closeTime]
  )
  const fromSupplier = slots?.key === slotsKey ? slots : null
  const slotsStatus: SlotsStatus = !supplierId
    ? hoursSlots.length
      ? "ready"
      : "none"
    : !deliveryDate
      ? "none"
      : (fromSupplier?.status ?? "loading")
  const slotStarts = supplierId ? (fromSupplier?.starts ?? []) : hoursSlots

  // Time: what the user picked if still offered, else the business's usual window, else the first slot
  const [chosenTime, setDeliveryTime] = useState("")
  const offered = slotStarts.map((start) => slotOrderValue(start, method))
  const usual = defaultDeliveryTime ? slotOrderValue(slotStartFromValue(defaultDeliveryTime), method) : null
  const deliveryTime = offered.includes(chosenTime)
    ? chosenTime
    : usual && offered.includes(usual)
      ? usual
      : (offered[0] ?? "")

  return {
    dayOptions,
    daysLoading,
    deliveryDate,
    setDeliveryDate,
    slotStarts,
    slotsStatus,
    deliveryTime,
    setDeliveryTime,
    loading: daysLoading || slotsStatus === "loading",
  }
}
