import type { CartDelivery } from "@/lib/api/cart"
import { formatMoney } from "@/lib/format"

/** "Delivery fee (£5.00 + 2%)" — the label when the band takes a percentage. */
export function deliveryFeeLabel(
  fee: CartDelivery["fee"],
  t: (key: string, values?: Record<string, string | number>) => string
) {
  if (!fee.percent) return t("storefront.deliveryFee")
  return t("storefront.deliveryFeeBasis", {
    flat: formatMoney(fee.flatAmount ?? 0),
    percent: fee.percent,
  })
}
