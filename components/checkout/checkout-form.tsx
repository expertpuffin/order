"use client"

import { useState, type FormEvent } from "react"
import { Loader2, ShieldCheck, Store, Truck } from "lucide-react"

import { choiceClass } from "@/components/brand/choice"
import { CheckoutPayment, useCheckoutPayment } from "@/components/checkout/checkout-payment"
import { SlotGrid } from "@/components/checkout/slot-grid"
import { useFulfilmentSchedule } from "@/components/checkout/use-fulfilment-schedule"
import { usePlaceOrder } from "@/components/checkout/use-place-order"
import { useI18n, useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useActionToast } from "@/lib/action-toast"
import { formatDayCard } from "@/lib/fulfilment-slots"
import type { ApprovalRuleCode, FulfillmentMethod } from "@/lib/domain"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export function CheckoutForm({
  businessId,
  supplierId,
  defaultDeliveryTime,
  openTime,
  closeTime,
  lineCount,
  businessName,
  businessPostcode,
  approval = null,
}: {
  businessId: string
  supplierId: string | null
  defaultDeliveryTime: string | null
  openTime?: string | null
  closeTime?: string | null
  lineCount: number
  businessName?: string | null
  businessPostcode?: string | null
  /** Set when this order will wait for a manager's OK first */
  approval?: { code: ApprovalRuleCode; limit: number | null } | null
}) {
  const t = useT()
  const { locale } = useI18n()
  const [method, setMethod] = useState<FulfillmentMethod>("delivery")
  const [showNote, setShowNote] = useState(false)
  const payment = useCheckoutPayment(businessId, supplierId, method, { managerApproval: Boolean(approval) })
  const schedule = useFulfilmentSchedule({
    businessId,
    supplierId,
    method,
    postcode: businessPostcode,
    openTime,
    closeTime,
    defaultDeliveryTime,
  })
  const { placeOrder, state, busy, error } = usePlaceOrder(businessId, payment)
  useActionToast(state)

  const deliveryLabel = [businessName, businessPostcode].filter(Boolean).join(" · ") || null

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void placeOrder(new FormData(event.currentTarget))
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="fulfillmentMethod" value={method} />
      <input type="hidden" name="requestedDeliveryDate" value={schedule.deliveryDate} />
      <input type="hidden" name="deliveryTime" value={schedule.deliveryTime} />

      <div className="rounded-[2px] border border-[var(--border-subtle)] bg-[#f7f7f8] px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {t("cart.checkoutSummaryItems", { count: String(lineCount) })}
      </div>

      <div className="space-y-2.5">
        <FieldLabel>{t("cart.checkoutFulfillment")}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "delivery", label: t("cart.checkoutDelivery"), icon: Truck },
              { value: "collection", label: t("cart.checkoutCollection"), icon: Store },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMethod(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-[2px] border px-3 py-3 text-sm font-medium transition-colors",
                choiceClass(method === value)
              )}
            >
              <Icon className="size-5 stroke-[1.75]" />
              {label}
            </button>
          ))}
        </div>
        {method === "delivery" && deliveryLabel ? (
          <p className="text-xs text-muted-foreground">
            {t("cart.checkoutDeliverTo")} <span className="font-medium text-[var(--brand-navy)]">{deliveryLabel}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <FieldLabel>{t("cart.checkoutDate")}</FieldLabel>
        {schedule.daysLoading ? (
          <Loading />
        ) : schedule.dayOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("cart.checkoutNoDates")}</p>
        ) : (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {schedule.dayOptions.map((iso) => {
              const card = formatDayCard(iso, locale)
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => schedule.setDeliveryDate(iso)}
                  className={cn(
                    "flex min-w-[88px] shrink-0 flex-col items-center rounded-[2px] border px-3 py-2.5 text-center transition-colors",
                    choiceClass(schedule.deliveryDate === iso)
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
          {schedule.deliveryDate ? formatDayCard(schedule.deliveryDate, locale).compact : "—"}
        </p>
      </div>

      <div className="space-y-3">
        <FieldLabel>{method === "collection" ? t("cart.checkoutCollectionTime") : t("cart.checkoutTime")}</FieldLabel>
        {schedule.loading ? (
          <Loading />
        ) : schedule.slotsStatus === "ready" ? (
          <SlotGrid
            starts={schedule.slotStarts}
            method={method}
            value={schedule.deliveryTime}
            onChange={schedule.setDeliveryTime}
          />
        ) : (
          <p className={cn("text-sm", schedule.slotsStatus === "failed" ? "text-destructive" : "text-muted-foreground")}>
            {t(schedule.slotsStatus === "failed" ? "cart.checkoutSlotsFailed" : "cart.checkoutNoSlots")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded-[2px] border border-[var(--border-subtle)] px-3 py-2.5 text-left text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/30"
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
            className="rounded-[2px] border-[var(--border-subtle)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
          />
        ) : null}
      </div>

      <CheckoutPayment businessId={businessId} payment={payment} />

      {approval ? (
        <div className="flex gap-2 rounded-[2px] border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-900">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{t(`approval.rule.${approval.code}`, { limit: formatMoney(approval.limit ?? 0) })}</p>
            <p className="text-xs text-amber-800/80">{t("approval.checkoutNote")}</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full rounded-[2px] btn-brand text-base font-semibold text-white"
        disabled={
          busy ||
          payment.loading ||
          payment.blocked ||
          lineCount === 0 ||
          !schedule.deliveryDate ||
          !schedule.deliveryTime ||
          schedule.loading
        }
      >
        {busy ? t("cart.checkoutSubmitting") : approval ? t("approval.checkoutSubmit") : t("cart.checkoutSubmit")}
      </Button>
    </form>
  )
}

function FieldLabel({ children }: { children: string }) {
  return <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{children}</Label>
}

function Loading() {
  const t = useT()
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {t("cart.checkoutLoadingSchedule")}
    </div>
  )
}
