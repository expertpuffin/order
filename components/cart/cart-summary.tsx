"use client"

import { useT } from "@/components/i18n/i18n-provider"
import type { CartSummary as Summary } from "@/lib/cart-summary"
import { deliveryFeeLabel } from "@/lib/delivery-fee"
import { formatMoney } from "@/lib/format"

/**
 * The cart's figures. `compact` (side cart) folds discounts into one line;
 * `full` (cart page) lists each one.
 */
export function CartSummary({ summary, variant }: { summary: Summary; variant: "compact" | "full" }) {
  const t = useT()
  const money = (n: number) => formatMoney(n, summary.currency)

  return (
    <dl className="space-y-1.5 text-sm">
      <Row label={t("storefront.subtotal")} value={money(summary.subtotal)} strong />
      {variant === "full" ? (
        summary.discounts.map((d) => <Row key={d.labelKey} label={t(d.labelKey)} value={`-${money(d.amount)}`} />)
      ) : summary.totalDiscount > 0 ? (
        <Row label={t("promotions.discount")} value={`-${money(summary.totalDiscount)}`} />
      ) : null}
      {summary.delivery ? (
        <Row
          label={deliveryFeeLabel(summary.delivery.fee, t)}
          value={summary.delivery.waived ? t("storefront.free") : money(summary.delivery.amount)}
        />
      ) : null}
      {summary.freeDeliveryGap ? (
        <p className="text-xs text-muted-foreground">
          {t("storefront.freeDeliveryNudge", { amount: money(summary.freeDeliveryGap) })}
        </p>
      ) : null}
      <div className="flex justify-between gap-4 border-t border-[var(--sidebar-border)] pt-2 text-base font-semibold text-[var(--brand-navy)]">
        <dt>{t("storefront.total")}</dt>
        <dd className="tabular-nums">{money(summary.total)}</dd>
      </div>
    </dl>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-muted-foreground">
      <dt>{label}</dt>
      <dd className={strong ? "font-medium tabular-nums text-[var(--brand-navy)]" : "tabular-nums"}>{value}</dd>
    </div>
  )
}
