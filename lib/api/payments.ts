import { apiFetch } from "@/lib/api/client"

/** How the goods are paid: on the supplier's account, or by card through Ordoria. */
export type PaymentMode = "account" | "ordoria"

export type PaymentModeReason =
  | "NO_ACCOUNT"
  | "CUSTOMER_BLOCKED"
  | "CREDIT_LIMIT"
  | "OVERDUE"
  | "ACCOUNT_ONLY"

/** Pricing preview › payment (backend services/ordoriaPayment.service) */
export type PaymentOptions = {
  modes: { mode: PaymentMode; available: boolean; reason: PaymentModeReason | null }[]
  defaultMode: PaymentMode | null
  /** The supplier takes card payments through Ordoria (module ordoria_payments) */
  moduleOn: boolean
  account: { termsDays: number; creditLimit: number | null; availableCredit: number | null } | null
  /** What a card payment takes: goods incl. VAT + delivery + service fee */
  card: {
    goodsNet: number
    deliveryFee: number
    vat: number
    gross: number
    serviceFee: number
    total: number
    totalPence: number
  }
}

export type SavedCard = {
  id: string
  brand: string
  last4: string
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
  expired: boolean
}

/** Saved-card hold: requires_capture = held, requires_action = show the bank's step */
export type CardHold = {
  paymentIntentId: string
  status: "requires_capture" | "requires_action"
  clientSecret: string
}

export async function previewPayment(
  businessId: string,
  input: {
    items: { listingId: string; quantity: number }[]
    supplierId?: string | null
    fulfillmentMethod: "delivery" | "collection"
    couponCode?: string | null
  }
): Promise<PaymentOptions | null> {
  const data = await apiFetch<{ payment?: PaymentOptions | null }>(
    `/api/businesses/${businessId}/pricing/preview`,
    {
      method: "POST",
      body: {
        items: input.items,
        supplierId: input.supplierId || undefined,
        fulfillmentMethod: input.fulfillmentMethod,
        couponCode: input.couponCode || undefined,
      },
    }
  )
  return data.payment ?? null
}

export async function listSavedCards(businessId: string) {
  return apiFetch<{ cards: SavedCard[]; defaultPaymentMethodId: string | null }>(
    `/api/businesses/${businessId}/payment-methods`
  )
}

export async function holdServiceFee(businessId: string, paymentMethodId: string) {
  return apiFetch<CardHold>(`/api/businesses/${businessId}/orders/service-fee-hold`, {
    method: "POST",
    body: { paymentMethodId, orderCount: 1 },
  })
}

export async function startAddCard(businessId: string) {
  return apiFetch<{ setupIntentClientSecret: string }>(
    `/api/businesses/${businessId}/payment-methods/setup`,
    { method: "POST" }
  )
}

export async function confirmAddedCard(businessId: string, setupIntentClientSecret: string) {
  return apiFetch<{ cards: SavedCard[]; defaultPaymentMethodId: string | null }>(
    `/api/businesses/${businessId}/payment-methods/confirm`,
    { method: "POST", body: { clientSecret: setupIntentClientSecret } }
  )
}

export async function getStripePublishableKey() {
  const data = await apiFetch<{ publishableKey: string }>(`/api/billing/config`)
  return data.publishableKey
}
