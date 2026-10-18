"use client"

import { loadStripe, type Stripe } from "@stripe/stripe-js"

let loaded: { key: string; stripe: Promise<Stripe | null> } | null = null

/** Stripe.js, loaded once per publishable key (it comes from the backend's billing config). */
export function getStripe(publishableKey: string) {
  if (!loaded || loaded.key !== publishableKey) {
    loaded = { key: publishableKey, stripe: loadStripe(publishableKey) }
  }
  return loaded.stripe
}

/**
 * The bank wants 3D Secure for a card hold: show its step in the page.
 * "held" = the hold is in place (requires_capture), "canceled" = they closed it.
 */
export async function confirmCardHold(
  publishableKey: string,
  clientSecret: string
): Promise<{ status: "held" } | { status: "canceled" } | { status: "failed"; message: string }> {
  const stripe = await getStripe(publishableKey)
  if (!stripe) return { status: "failed", message: "Card payments couldn't load" }
  const { paymentIntent, error } = await stripe.handleNextAction({ clientSecret })
  if (error) {
    if (error.code === "payment_intent_authentication_failure" && !error.message) {
      return { status: "canceled" }
    }
    return { status: "failed", message: error.message || "Your bank didn't approve the payment" }
  }
  if (paymentIntent?.status === "requires_capture" || paymentIntent?.status === "succeeded") {
    return { status: "held" }
  }
  return { status: "failed", message: "Your bank didn't approve the payment" }
}
