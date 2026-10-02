import type { CartDelivery } from "@/lib/api/cart"

/** "Delivery fee (£5.00 + 2%)" — the label when the band takes a percentage. */
export function deliveryFeeLabel(
  fee: CartDelivery["fee"],
  t: (key: string, values?: Record<string, string | number>) => string
) {
  if (!fee.percent) return t("storefront.deliveryFee")
  return t("storefront.deliveryFeeBasis", {
    flat: (fee.flatAmount ?? 0).toFixed(2),
    percent: fee.percent,
  })
}
