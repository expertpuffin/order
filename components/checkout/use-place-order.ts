"use client"

import { startTransition, useActionState, useEffect, useRef, useState } from "react"

import type { CheckoutPaymentState } from "@/components/checkout/checkout-payment"
import { useT } from "@/components/i18n/i18n-provider"
import { checkoutAction, holdServiceFeeAction } from "@/lib/actions/checkout"
import { ERROR_CODES } from "@/lib/domain"
import { confirmCardHold } from "@/lib/stripe-client"

/**
 * Placing the order, in the order the money requires:
 * 1. Account mode with a service fee → hold the fee on the chosen card (3D Secure if asked)
 * 2. Paid by card → the server holds the whole order on the card while it places it
 * 3. The bank asks for 3D Secure on that hold → show its step, then place again on the confirmed hold
 * A closed account that may pay by card switches the form to card instead.
 */
export function usePlaceOrder(businessId: string, payment: CheckoutPaymentState) {
  const t = useT()
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  // The action reducer runs after the render that started it; it reads the payment state through this.
  const paymentRef = useRef(payment)
  useEffect(() => {
    paymentRef.current = payment
  })

  /** One place for the bank's 3D Secure step: null when it went through, else what to tell the user. */
  const confirmStep = async (clientSecret: string): Promise<{ stop: "canceled" } | { error: string } | null> => {
    const key = paymentRef.current.publishableKey
    if (!key) return { error: t("payment.cardsUnavailable") }
    const step = await confirmCardHold(key, clientSecret)
    if (step.status === "canceled") return { stop: "canceled" }
    if (step.status === "failed")
      return { error: step.message ?? t(step.reason === "unavailable" ? "payment.cardsUnavailable" : "payment.cardDeclined") }
    return null
  }

  const [state, formAction, pending] = useActionState(
    async (prev: Awaited<ReturnType<typeof checkoutAction>> | null, fd: FormData) => {
      const res = await checkoutAction(prev, fd)
      if (!res || !("code" in res)) return res
      const details = ("details" in res ? res.details : null) as Record<string, unknown> | null
      if (res.code === ERROR_CODES.creditHold && details?.cardAvailable) {
        paymentRef.current.setChoice("ordoria")
        return res
      }
      if (res.code !== ERROR_CODES.paymentActionRequired) return res
      const outcome = await confirmStep(String(details?.clientSecret ?? ""))
      if (outcome && "stop" in outcome) return null
      if (outcome) return outcome
      const retry = new FormData()
      fd.forEach((value, name) => retry.set(name, value))
      retry.delete("paymentMethodId")
      retry.set("orderPaymentIntentId", String(details?.paymentIntentId ?? ""))
      return checkoutAction(prev, retry)
    },
    null
  )

  const placeOrder = async (fd: FormData) => {
    setPayError(null)
    if (payment.options?.moduleOn) fd.set("paymentMode", payment.mode)
    if (payment.cardNeeded && !payment.cardId) {
      setPayError(t("payment.cardRequired"))
      return
    }
    if (payment.payByCard && payment.cardId) {
      fd.set("paymentMethodId", payment.cardId)
    } else if (payment.feeDue && payment.cardId) {
      setPaying(true)
      try {
        const res = await holdServiceFeeAction(businessId, payment.cardId)
        if ("error" in res || !res.hold) {
          setPayError(("error" in res && res.error) || t("payment.cardDeclined"))
          return
        }
        if (res.hold.status === "requires_action") {
          const outcome = await confirmStep(res.hold.clientSecret)
          if (outcome && "stop" in outcome) return
          if (outcome) {
            setPayError(outcome.error)
            return
          }
        }
        fd.set("serviceFeePaymentIntentId", res.hold.paymentIntentId)
      } finally {
        setPaying(false)
      }
    }
    startTransition(() => formAction(fd))
  }

  const error = payError || (state && "error" in state ? state.error : null)
  return { placeOrder, state, busy: pending || paying, error }
}
