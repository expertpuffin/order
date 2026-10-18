"use client"

import { useEffect, useRef, useState } from "react"
import { CreditCard, FileText, Loader2, Plus } from "lucide-react"
import type { StripeCardElement } from "@stripe/stripe-js"

import {
  finishAddCardAction,
  loadCheckoutPayment,
  startAddCardAction,
} from "@/lib/actions/payments"
import type { PaymentMode, PaymentOptions, SavedCard } from "@/lib/api/payments"
import { getStripe } from "@/lib/stripe-client"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const gbp = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n)

export type CheckoutPaymentState = ReturnType<typeof useCheckoutPayment>

/**
 * How this cart is paid: on the supplier's account (the card only holds the service
 * fee) or by card through Ordoria (the whole order is held, fee included).
 * Re-read when the fulfilment method changes — delivery changes the card total.
 */
export function useCheckoutPayment(
  businessId: string,
  supplierId: string | null,
  fulfillment: "delivery" | "collection",
  { managerApproval }: { managerApproval: boolean }
) {
  const [options, setOptions] = useState<PaymentOptions | null>(null)
  const [cards, setCards] = useState<SavedCard[]>([])
  const [publishableKey, setPublishableKey] = useState<string | null>(null)
  // Which cart + method the options belong to — loading until they match.
  const requestKey = `${businessId}|${supplierId ?? ""}|${fulfillment}`
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const loading = loadedKey !== requestKey
  const [choice, setChoice] = useState<PaymentMode | null>(null)
  const [cardId, setCardId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadCheckoutPayment(businessId, supplierId, fulfillment)
      .then((res) => {
        if (cancelled) return
        setOptions(res.options)
        setCards(res.cards)
        setPublishableKey(res.publishableKey)
        setCardId(
          (cur) =>
            cur ??
            res.cards.find((c) => c.isDefault && !c.expired)?.id ??
            res.cards.find((c) => !c.expired)?.id ??
            null
        )
      })
      .catch(() => {
        if (!cancelled) setOptions(null)
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(`${businessId}|${supplierId ?? ""}|${fulfillment}`)
      })
    return () => {
      cancelled = true
    }
  }, [businessId, supplierId, fulfillment])

  const open = options?.modes.filter((m) => m.available).map((m) => m.mode) ?? []
  const mode: PaymentMode = !options?.moduleOn
    ? "account"
    : choice && open.includes(choice)
      ? choice
      : options.defaultMode ?? "account"
  // A request for a manager holds nothing now; the approver's card pays later.
  const payByCard = mode === "ordoria" && !managerApproval
  const feeDue = !managerApproval && !payByCard && (options?.card.serviceFee ?? 0) > 0
  const blocked = Boolean(options?.moduleOn && open.length === 0)

  return {
    options,
    cards,
    publishableKey,
    loading,
    mode,
    setChoice,
    cardId,
    setCardId,
    payByCard,
    feeDue,
    cardNeeded: payByCard || feeDue,
    blocked,
    managerApproval,
    onCardAdded: (next: SavedCard[], defaultId: string | null) => {
      setCards(next)
      setCardId(defaultId)
    },
  }
}

export function CheckoutPayment({
  businessId,
  payment,
}: {
  businessId: string
  payment: CheckoutPaymentState
}) {
  const t = useT()
  const [adding, setAdding] = useState(false)
  const { options, cards, loading, mode, payByCard, cardNeeded } = payment

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("payment.loading")}
      </div>
    )
  }
  if (!options) return null

  const open = options.modes.filter((m) => m.available)
  const account = options.modes.find((m) => m.mode === "account")
  const showModes = options.moduleOn && !payment.managerApproval
  const closedNote =
    account && !account.available && account.reason && ["CREDIT_LIMIT", "OVERDUE", "NO_ACCOUNT"].includes(account.reason)
      ? t(`payment.closed.${account.reason}`)
      : null

  const subtitle = (m: PaymentMode) => {
    if (m === "ordoria") return t("payment.ordoriaSub", { amount: gbp(options.card.total) })
    const acc = options.account
    if (!acc) return ""
    const terms = t("payment.accountSub", { days: String(acc.termsDays) })
    return acc.availableCredit != null
      ? `${terms} · ${t("payment.accountCredit", { amount: gbp(acc.availableCredit) })}`
      : terms
  }

  return (
    <div className="space-y-2.5">
      {showModes ? (
        <>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("payment.title")}
          </p>
          {payment.blocked ? (
            <p className="rounded-[2px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {t("payment.blocked")}
            </p>
          ) : (
            <div className="space-y-2" role={open.length > 1 ? "radiogroup" : undefined}>
              {open.map((row) => {
                const active = row.mode === mode
                const single = open.length === 1
                const Icon = row.mode === "ordoria" ? CreditCard : FileText
                return (
                  <button
                    key={row.mode}
                    type="button"
                    role={single ? undefined : "radio"}
                    aria-checked={single ? undefined : active}
                    disabled={single}
                    onClick={() => payment.setChoice(row.mode)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[2px] border px-3 py-2.5 text-left transition-colors",
                      active && !single
                        ? "border-[var(--brand-navy)] bg-[var(--brand-navy)]/5"
                        : "border-[var(--sidebar-border)] bg-white",
                      single ? "cursor-default" : "hover:bg-muted/40"
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-[var(--brand-navy)]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--brand-navy)]">
                        {t(row.mode === "ordoria" ? "payment.ordoria" : "payment.account")}
                      </span>
                      <span className="block text-xs text-muted-foreground">{subtitle(row.mode)}</span>
                      {row.mode === "ordoria" ? (
                        <span className="block text-xs text-muted-foreground/80">
                          {options.card.vat > 0
                            ? t("payment.ordoriaVat", { vat: gbp(options.card.vat) })
                            : t("payment.ordoriaFeeIncluded")}
                        </span>
                      ) : null}
                    </span>
                    {active && !single ? (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--brand-navy)]" aria-hidden />
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
          {closedNote ? <p className="text-xs text-muted-foreground">{closedNote}</p> : null}
        </>
      ) : null}

      {cardNeeded ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {payByCard
              ? t("payment.payOrderWith", { amount: gbp(options.card.total) })
              : t("payment.payFeeWith", { amount: gbp(options.card.serviceFee) })}
          </p>
          {!payByCard ? <p className="text-xs text-muted-foreground">{t("payment.feeHoldHint")}</p> : null}
          {cards.length ? (
            <div className="space-y-1.5" role="radiogroup" aria-label={t("payment.cards")}>
              {cards.map((card) => {
                const active = card.id === payment.cardId
                return (
                  <button
                    key={card.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={card.expired}
                    onClick={() => payment.setCardId(card.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[2px] border px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "border-[var(--brand-navy)] bg-[var(--brand-navy)]/5"
                        : "border-[var(--sidebar-border)] bg-white hover:bg-muted/40",
                      card.expired && "opacity-50"
                    )}
                  >
                    <CreditCard className="size-4 shrink-0 text-[var(--brand-navy)]" />
                    <span className="flex-1 font-medium capitalize text-[var(--brand-navy)]">
                      {card.brand} •••• {card.last4}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {card.expired
                        ? t("payment.expired")
                        : `${String(card.expMonth ?? "").padStart(2, "0")}/${String(card.expYear ?? "").slice(-2)}`}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}
          {adding && payment.publishableKey ? (
            <AddCardInline
              businessId={businessId}
              publishableKey={payment.publishableKey}
              onCancel={() => setAdding(false)}
              onAdded={(next, defaultId) => {
                payment.onCardAdded(next, defaultId)
                setAdding(false)
              }}
            />
          ) : payment.publishableKey ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center gap-2 rounded-[2px] border border-dashed border-[var(--sidebar-border)] px-3 py-2 text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/30"
            >
              <Plus className="size-4" />
              {t("payment.addCard")}
            </button>
          ) : (
            <p className="text-xs text-muted-foreground">{t("payment.cardsUnavailable")}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

/** Card number goes straight to Stripe (Card Element); we only keep the saved card's id. */
function AddCardInline({
  businessId,
  publishableKey,
  onAdded,
  onCancel,
}: {
  businessId: string
  publishableKey: string
  onAdded: (cards: SavedCard[], defaultId: string | null) => void
  onCancel: () => void
}) {
  const t = useT()
  const mountRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<StripeCardElement | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let element: StripeCardElement | null = null
    let cancelled = false
    void getStripe(publishableKey).then((stripe) => {
      if (cancelled || !stripe || !mountRef.current) return
      element = stripe.elements().create("card", {
        hidePostalCode: true,
        style: { base: { fontSize: "14px", color: "#0f1a3c" } },
      })
      element.mount(mountRef.current)
      cardRef.current = element
    })
    return () => {
      cancelled = true
      element?.destroy()
      cardRef.current = null
    }
  }, [publishableKey])

  const save = async () => {
    const stripe = await getStripe(publishableKey)
    if (!stripe || !cardRef.current) return
    setSaving(true)
    setError(null)
    try {
      const started = await startAddCardAction(businessId)
      if ("error" in started) {
        setError(started.error ?? null)
        return
      }
      const { error: stripeError } = await stripe.confirmCardSetup(started.clientSecret, {
        payment_method: { card: cardRef.current },
      })
      if (stripeError) {
        setError(stripeError.message || t("payment.cardNotSaved"))
        return
      }
      const done = await finishAddCardAction(businessId, started.clientSecret)
      if ("error" in done) {
        setError(done.error ?? null)
        return
      }
      onAdded(done.cards, done.defaultPaymentMethodId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2 rounded-[2px] border border-[var(--sidebar-border)] bg-white p-3">
      <div ref={mountRef} className="min-h-[22px] py-1" />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="rounded-[2px]" onClick={onCancel} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button type="button" size="sm" className="rounded-[2px] btn-brand text-white" onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("payment.saveCard")}
        </Button>
      </div>
    </div>
  )
}
