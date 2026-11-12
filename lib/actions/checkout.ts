"use server"

import { redirect } from "next/navigation"

import { checkoutCart, getCart } from "@/lib/api/cart"
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
import { fetchSupplierAvailability, fetchSupplierSlots } from "@/lib/api/supplierFulfillment"
import { actionError, failure, formString, refreshAllPages } from "@/lib/actions/result"
import { ApiError } from "@/lib/backend/errors"
import { ERROR_CODES, type FulfillmentMethod } from "@/lib/domain"
import { placedOrdersHref } from "@/lib/order"

/**
 * Checkout errors the form acts on, with just what it needs: the bank's 3D Secure
 * step and whether a closed account can pay by card instead.
 */
async function checkoutError(error: unknown) {
  if (!(error instanceof ApiError)) return actionError(error)
  const d = error.details ?? {}
  if (error.code === ERROR_CODES.paymentActionRequired) {
    return {
      error: error.message,
      code: error.code,
      details: { paymentIntentId: String(d.paymentIntentId ?? ""), clientSecret: String(d.clientSecret ?? "") },
    }
  }
  if (error.code === ERROR_CODES.creditHold) {
    return { error: error.message, code: error.code, details: { cardAvailable: Boolean(d.cardAvailable) } }
  }
  return actionError(error)
}

/** The cart becomes an order with its one supplier. */
export async function checkoutAction(_prev: unknown, formData: FormData) {
  const businessId = formString(formData, "businessId")
  const requestedDeliveryDate = formString(formData, "requestedDeliveryDate")
  if (!businessId || !requestedDeliveryDate) {
    return failure("errors.deliveryDateRequired")
  }

  const paymentMode = formString(formData, "paymentMode")
  let orders
  try {
    orders = await checkoutCart(businessId, {
      requestedDeliveryDate,
      fulfillmentMethod: formString(formData, "fulfillmentMethod") === "collection" ? "collection" : "delivery",
      deliveryTime: formString(formData, "deliveryTime") || null,
      specialNote: formString(formData, "specialNote") || null,
      serviceFeePaymentIntentId: formString(formData, "serviceFeePaymentIntentId") || undefined,
      paymentMode: paymentMode === "ordoria" || paymentMode === "account" ? paymentMode : undefined,
      paymentMethodId: formString(formData, "paymentMethodId") || undefined,
      orderPaymentIntentId: formString(formData, "orderPaymentIntentId") || undefined,
    })
  } catch (error) {
    return checkoutError(error)
  }

  refreshAllPages()
  redirect(placedOrdersHref(orders))
}

/**
 * How this cart can be paid (account / card through Ordoria), what a card payment
 * takes, the saved cards and the key Stripe.js needs. Fails as a whole when the
 * payment terms can't be loaded: checkout must not go ahead without them.
 */
export async function loadCheckoutPayment(
  businessId: string,
  supplierId: string | null,
  fulfillmentMethod: FulfillmentMethod
): Promise<
  | { success: true; options: PaymentOptions | null; cards: SavedCard[]; publishableKey: string | null }
  | { error: string }
> {
  try {
    const { lines, couponCode } = await getCart(businessId)
    const items = lines
      .filter((l) => l.listingId)
      .map((l) => ({ listingId: l.listingId as string, quantity: l.quantity }))
    const [options, cards, publishableKey] = await Promise.all([
      items.length ? previewPayment(businessId, { items, supplierId, fulfillmentMethod, couponCode }) : null,
      // Saved cards and the Stripe key only matter for card payments; without them
      // the form offers adding a card, so their failure isn't fatal.
      listSavedCards(businessId)
        .then((res) => res.cards)
        .catch(() => [] as SavedCard[]),
      getStripePublishableKey().catch(() => null),
    ])
    return { success: true, options, cards, publishableKey }
  } catch (error) {
    return actionError(error)
  }
}

/** Account mode: hold the service fee on a saved card before checkout. */
export async function holdServiceFeeAction(businessId: string, paymentMethodId: string) {
  try {
    return { hold: await holdServiceFee(businessId, paymentMethodId) }
  } catch (error) {
    return actionError(error)
  }
}

/** Add a card: a SetupIntent for Stripe.js to confirm with the typed card. */
export async function startAddCardAction(businessId: string) {
  try {
    const session = await startAddCard(businessId)
    return { clientSecret: session.setupIntentClientSecret }
  } catch (error) {
    return actionError(error)
  }
}

/** After Stripe.js confirmed the card: it becomes the default. */
export async function finishAddCardAction(businessId: string, setupIntentClientSecret: string) {
  try {
    const res = await confirmAddedCard(businessId, setupIntentClientSecret)
    return { cards: res.cards, defaultPaymentMethodId: res.defaultPaymentMethodId }
  } catch (error) {
    return actionError(error)
  }
}

export async function loadSupplierAvailability(
  supplierId: string,
  method: FulfillmentMethod,
  opts?: { from?: string; days?: number; postcode?: string | null; businessId?: string | null }
) {
  return fetchSupplierAvailability(supplierId, method, opts)
}

export async function loadSupplierSlots(
  supplierId: string,
  method: FulfillmentMethod,
  date: string,
  opts?: { postcode?: string | null; businessId?: string | null }
) {
  return fetchSupplierSlots(supplierId, method, date, opts)
}
