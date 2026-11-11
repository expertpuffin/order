import type { CartDelivery, CartLine, CartPricing } from "@/lib/api/cart"

export type CartSummary = {
  currency: string
  /** Before any discount */
  subtotal: number
  discounts: Array<{ labelKey: string; amount: number }>
  totalDiscount: number
  /** Goods after discounts — what free delivery and manager approval are measured against */
  goodsTotal: number
  /** Shown when the band charges at all; `amount` is 0 when waived */
  delivery: { fee: CartDelivery["fee"]; amount: number; waived: boolean } | null
  /** How much more until delivery is free, when that applies */
  freeDeliveryGap: number | null
  total: number
}

/**
 * Every cart figure comes from the server's pricing (the same numbers checkout
 * charges). Lines are only summed while pricing hasn't loaded.
 */
export function summarizeCart(pricing: CartPricing | null | undefined, lines: CartLine[]): CartSummary {
  const linesTotal = lines.reduce((sum, line) => (line.unitPrice == null ? sum : sum + line.unitPrice * line.quantity), 0)
  const subtotal = pricing?.subtotalBeforeDiscounts ?? linesTotal
  const goodsTotal = pricing?.grandTotal ?? subtotal
  const fee = pricing?.delivery?.fee ?? null
  const deliveryAmount = fee && !fee.waived ? fee.amount : 0

  return {
    currency: pricing?.currency ?? lines[0]?.currency ?? "GBP",
    subtotal,
    discounts: pricing
      ? [
          { labelKey: "promotions.dealDiscount", amount: pricing.skuDealDiscount },
          { labelKey: "promotions.campaignDiscount", amount: pricing.campaignDiscount },
          { labelKey: "promotions.couponDiscount", amount: pricing.couponDiscount },
        ].filter((d) => d.amount > 0)
      : [],
    totalDiscount: pricing?.totalDiscount ?? 0,
    goodsTotal,
    delivery: fee && fee.standardAmount > 0 ? { fee, amount: deliveryAmount, waived: fee.waived } : null,
    freeDeliveryGap:
      fee && !fee.waived && fee.freeDeliveryOver != null ? Math.max(0, fee.freeDeliveryOver - goodsTotal) : null,
    total: goodsTotal + deliveryAmount,
  }
}
