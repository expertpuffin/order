"use server"

import { getCart } from "@/lib/api/cart"
import { ApiError } from "@/lib/api/errors"
import {
  confirmAddedCard,
  getStripePublishableKey,
  holdServiceFee,
  listSavedCards,
  previewPayment,
  startAddCard,
  type PaymentOptions,
  type SavedCard,
} from "@/lib/api/payments"

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : "Something went wrong"

/**
 * Checkout › Payment: how this cart can be paid (account / card through Ordoria),
 * what a card payment takes, the saved cards and the key Stripe.js needs.
 */
export async function loadCheckoutPayment(
  businessId: string,
  supplierId: string | null,
  fulfillmentMethod: "delivery" | "collection"
): Promise<{
  options: PaymentOptions | null
  cards: SavedCard[]
  publishableKey: string | null
}> {
  const { lines, couponCode } = await getCart(businessId)
  const items = lines
    .filter((l) => l.listingId)
    .map((l) => ({ listingId: l.listingId as string, quantity: l.quantity }))
  const [options, cards, publishableKey] = await Promise.all([
    items.length
      ? previewPayment(businessId, { items, supplierId, fulfillmentMethod, couponCode }).catch(() => null)
      : Promise.resolve(null),
    listSavedCards(businessId)
      .then((res) => res.cards)
      .catch(() => [] as SavedCard[]),
    getStripePublishableKey().catch(() => null),
  ])
  return { options, cards, publishableKey }
}

/** Account mode: hold the service fee on a saved card before checkout. */
export async function holdServiceFeeAction(businessId: string, paymentMethodId: string) {
  try {
    return { hold: await holdServiceFee(businessId, paymentMethodId) }
  } catch (error) {
    return { error: messageOf(error), code: error instanceof ApiError ? error.code ?? null : null }
  }
}

/** Add a card: a SetupIntent for Stripe.js to confirm with the typed card. */
export async function startAddCardAction(businessId: string) {
  try {
    const session = await startAddCard(businessId)
    return { clientSecret: session.setupIntentClientSecret }
  } catch (error) {
    return { error: messageOf(error) }
  }
}

/** After Stripe.js confirmed the card: it becomes the default. */
export async function finishAddCardAction(businessId: string, setupIntentClientSecret: string) {
  try {
    const res = await confirmAddedCard(businessId, setupIntentClientSecret)
    return { cards: res.cards, defaultPaymentMethodId: res.defaultPaymentMethodId }
  } catch (error) {
    return { error: messageOf(error) }
  }
}
