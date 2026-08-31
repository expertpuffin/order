"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { Loader2, Store, Truck } from "lucide-react"

import { checkoutAction } from "@/lib/actions"
import { useActionToast } from "@/lib/action-toast"
import {
  loadSupplierAvailability,
  loadSupplierSlots,
} from "@/lib/actions/supplier-slots"
import { useT, useI18n } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  formatDayCard,
  isMorningSlot,
  slotsFromBusinessHours,
  upcomingFulfillmentDays,
} from "@/lib/checkout-slots"
import {
  slotDisplayLabel,
  slotOrderValue,
  slotStartFromValue,
} from "@/lib/slot-format"
import { cn } from "@/lib/utils"

type FulfillmentMethod = "delivery" | "collection"

type CheckoutFormProps = {
  businessId: string
  supplierId: string | null
  defaultDeliveryTime: string | null
  openTime?: string | null
  closeTime?: string | null
  lineCount: number
  businessName?: string | null
  businessPostcode?: string | null
}

export function CheckoutForm({
  businessId,
  supplierId,
  defaultDeliveryTime,
  openTime,
  closeTime,
  lineCount,
  businessName,
  businessPostcode,
}: CheckoutFormProps) {
  const t = useT()
  const { locale } = useI18n()
  const [state, formAction, pending] = useActionState(checkoutAction, null)
  useActionToast(state)

  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("delivery")
  const [showNote, setShowNote] = useState(false)
  const [daysLoading, setDaysLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [availableDaySet, setAvailableDaySet] = useState<Set<string> | null>(
    null
  )

  const candidateDays = useMemo(
    () =>
      upcomingFulfillmentDays(14, {
        method: fulfillment,
        deliveryCutoffMissed: false,
      }),
    [fulfillment]
  )

  const dayOptions = useMemo(() => {
    if (availableDaySet == null) return candidateDays
    return candidateDays.filter((d) => availableDaySet.has(d))
  }, [availableDaySet, candidateDays])

  const [deliveryDate, setDeliveryDate] = useState(candidateDays[0] ?? "")

  useEffect(() => {
    if (!supplierId) {
      setAvailableDaySet(null)
      return
    }
    let cancelled = false
    setDaysLoading(true)
    void loadSupplierAvailability(supplierId, fulfillment, {
      from: candidateDays[0],
      days: 14,
      postcode: fulfillment === "delivery" ? businessPostcode : undefined,
      businessId,
    })
      .then((res) => {
        if (cancelled) return
        setAvailableDaySet(
          new Set(
            (res.days ?? []).filter((d) => d.available).map((d) => d.date)
          )
        )
      })
      .catch(() => {
        if (!cancelled) setAvailableDaySet(null)
      })
      .finally(() => {
        if (!cancelled) setDaysLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    supplierId,
    fulfillment,
    candidateDays,
    businessPostcode,
    businessId,
  ])

  useEffect(() => {
    const next = dayOptions[0] ?? ""
    if (!dayOptions.includes(deliveryDate)) {
      setDeliveryDate(next)
    }
  }, [dayOptions, deliveryDate])

  const [apiSlotStarts, setApiSlotStarts] = useState<string[] | null>(null)

  useEffect(() => {
    if (!deliveryDate) {
      setApiSlotStarts(null)
      return
    }
    if (!supplierId) {
      setApiSlotStarts(null)
      return
    }
    let cancelled = false
    setSlotsLoading(true)
    void loadSupplierSlots(supplierId, fulfillment, deliveryDate, {
      postcode: fulfillment === "delivery" ? businessPostcode : undefined,
      businessId,
    })
      .then((res) => {
        if (cancelled) return
        setApiSlotStarts(res.available ? res.slots : [])
      })
      .catch(() => {
        if (!cancelled) setApiSlotStarts(null)
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [
    supplierId,
    fulfillment,
    deliveryDate,
    businessPostcode,
    businessId,
  ])

  const slotStarts = useMemo(() => {
    if (apiSlotStarts != null && apiSlotStarts.length > 0) {
      return apiSlotStarts
    }
    if (!deliveryDate) return []
    return slotsFromBusinessHours(
      deliveryDate,
      fulfillment,
      openTime,
      closeTime
    )
  }, [apiSlotStarts, deliveryDate, fulfillment, openTime, closeTime])

  const morningSlots = slotStarts.filter(isMorningSlot)
  const afternoonSlots = slotStarts.filter((s) => !isMorningSlot(s))

  const [deliveryTime, setDeliveryTime] = useState<string>("")

  useEffect(() => {
    if (!slotStarts.length) {
      setDeliveryTime("")
      return
    }
    const preferredStart = defaultDeliveryTime
      ? slotStartFromValue(defaultDeliveryTime)
      : null
    const start =
      preferredStart && slotStarts.includes(preferredStart)
        ? preferredStart
        : slotStarts[0]
    setDeliveryTime(slotOrderValue(start, fulfillment))
  }, [slotStarts, defaultDeliveryTime, deliveryDate, fulfillment])

  const deliveryLabel =
    businessName && businessPostcode
      ? `${businessName} · ${businessPostcode}`
      : businessName || businessPostcode || null

  const scheduleLoading = daysLoading || slotsLoading

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="fulfillmentMethod" value={fulfillment} />
      <input type="hidden" name="requestedDeliveryDate" value={deliveryDate} />
      <input type="hidden" name="deliveryTime" value={deliveryTime} />

      <div className="rounded-[2px] border border-[var(--sidebar-border)] bg-[#f7f7f8] px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {t("cart.checkoutSummaryItems", { count: String(lineCount) })}
      </div>

      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {t("cart.checkoutFulfillment")}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                value: "delivery" as const,
                label: t("cart.checkoutDelivery"),
                icon: Truck,
              },
              {
                value: "collection" as const,
                label: t("cart.checkoutCollection"),
                icon: Store,
              },
            ] as const
          ).map(({ value, label, icon: Icon }) => {
            const active = fulfillment === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFulfillment(value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-[2px] border px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                    : "border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)] hover:bg-muted/40"
                )}
              >
                <Icon className="size-5 stroke-[1.75]" />
                {label}
              </button>
            )
          })}
        </div>
        {fulfillment === "delivery" && deliveryLabel ? (
          <p className="text-xs text-muted-foreground">
            {t("cart.checkoutDeliverTo")}{" "}
            <span className="font-medium text-[var(--brand-navy)]">
              {deliveryLabel}
            </span>
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {t("cart.checkoutDate")}
        </Label>
        {daysLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t("cart.checkoutLoadingSchedule")}
          </div>
        ) : dayOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("cart.checkoutNoDates")}
          </p>
        ) : (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {dayOptions.map((iso) => {
              const card = formatDayCard(iso, locale)
              const active = deliveryDate === iso
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setDeliveryDate(iso)}
                  className={cn(
                    "flex min-w-[88px] shrink-0 flex-col items-center rounded-[2px] border px-3 py-2.5 text-center transition-colors",
                    active
                      ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                      : "border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)] hover:bg-muted/40"
                  )}
                >
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wide opacity-80">
                    {card.weekdayShort}
                  </span>
                  <span className="text-sm font-semibold">{card.dayMonth}</span>
                </button>
              )
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {deliveryDate ? formatDayCard(deliveryDate, locale).compact : "—"}
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {fulfillment === "collection"
            ? t("cart.checkoutCollectionTime")
            : t("cart.checkoutTime")}
        </Label>
        {scheduleLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t("cart.checkoutLoadingSchedule")}
          </div>
        ) : slotStarts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("cart.checkoutNoSlots")}
          </p>
        ) : (
          <>
            {morningSlots.length > 0 ? (
              <div className="space-y-2">
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {t("cart.checkoutMorning")}
                </p>
                <div
                  className={cn(
                    "grid gap-2",
                    fulfillment === "collection"
                      ? "grid-cols-3 sm:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3"
                  )}
                >
                  {morningSlots.map((slotStart) => {
                    const value = slotOrderValue(slotStart, fulfillment)
                    return (
                      <button
                        key={slotStart}
                        type="button"
                        onClick={() => setDeliveryTime(value)}
                        className={cn(
                          "rounded-[2px] border py-2 text-sm font-medium tabular-nums transition-colors",
                          deliveryTime === value
                            ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                            : "border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)] hover:bg-muted/40"
                        )}
                      >
                        {slotDisplayLabel(slotStart, fulfillment)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
            {afternoonSlots.length > 0 ? (
              <div className="space-y-2">
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {t("cart.checkoutAfternoon")}
                </p>
                <div
                  className={cn(
                    "grid gap-2",
                    fulfillment === "collection"
                      ? "grid-cols-3 sm:grid-cols-4"
                      : "grid-cols-2 sm:grid-cols-3"
                  )}
                >
                  {afternoonSlots.map((slotStart) => {
                    const value = slotOrderValue(slotStart, fulfillment)
                    return (
                      <button
                        key={slotStart}
                        type="button"
                        onClick={() => setDeliveryTime(value)}
                        className={cn(
                          "rounded-[2px] border py-2 text-sm font-medium tabular-nums transition-colors",
                          deliveryTime === value
                            ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                            : "border-[var(--sidebar-border)] bg-white text-[var(--brand-navy)] hover:bg-muted/40"
                        )}
                      >
                        {slotDisplayLabel(slotStart, fulfillment)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded-[2px] border border-[var(--sidebar-border)] px-3 py-2.5 text-left text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/30"
          onClick={() => setShowNote((open) => !open)}
        >
          {t("cart.checkoutNoteToggle")}
        </button>
        {showNote ? (
          <Textarea
            id="specialNote"
            name="specialNote"
            rows={3}
            placeholder={t("cart.checkoutNotePlaceholder")}
            className="rounded-[2px] border-[var(--sidebar-border)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
          />
        ) : null}
      </div>

      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full rounded-[2px] bg-[var(--brand-navy)] text-base font-semibold text-white hover:bg-[var(--brand-navy)]/90"
        disabled={
          pending ||
          lineCount === 0 ||
          !deliveryDate ||
          !deliveryTime ||
          scheduleLoading
        }
      >
        {pending ? t("cart.checkoutSubmitting") : t("cart.checkoutSubmit")}
      </Button>
    </form>
  )
}
