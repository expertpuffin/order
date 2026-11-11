"use client"

import Link from "next/link"

import { EmptyState } from "@/components/brand/empty-state"
import { ProductImage } from "@/components/brand/product-image"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { CartSummary } from "@/components/cart/cart-summary"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { useCartLine } from "@/components/cart/use-cart-line"
import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import { Button } from "@/components/ui/button"
import type { CartLine, CartPricing } from "@/lib/api/cart"
import { summarizeCart } from "@/lib/cart-summary"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

/** The side cart on storefront pages (desktop rail, mobile sheet). */
export function CartPanel({
  lines,
  businessId,
  pricing,
  className,
}: {
  lines: CartLine[]
  businessId: string | null
  pricing?: CartPricing | null
  className?: string
}) {
  const t = useT()
  const { requestCheckout, canOrder } = useAuthGate()
  const { pending, update, remove } = useCartLine(businessId)
  const summary = summarizeCart(pricing, lines)
  const money = (n: number) => formatMoney(n, summary.currency)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <aside className={cn("flex h-full min-h-0 flex-col bg-background text-[var(--brand-navy)]", className)}>
      <header className="shrink-0 border-b border-[var(--sidebar-border)] px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">{t("storefront.yourCart")}</h2>
          {lines.length > 0 ? (
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {t("storefront.cartItems", { count: String(itemCount) })}
            </span>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {lines.length === 0 ? (
          <EmptyState
            compact
            icon={PUFFIN_ICONS.emptyCart}
            eyebrow={t("storefront.yourCart")}
            title={t("storefront.cartEmpty")}
            className="h-full min-h-[12rem] justify-center"
          />
        ) : (
          <ul className="divide-y divide-[var(--sidebar-border)]">
            {lines.map((line) => (
              <li key={line.id} className="px-4 py-3.5">
                <div className="flex gap-3">
                  <div className="size-11 shrink-0 overflow-hidden border border-[var(--sidebar-border)] bg-muted/30">
                    <ProductImage src={line.imageUrl} name={line.name} initials={2} className="text-[10px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-snug text-[var(--brand-navy)]">{line.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {line.unit}
                          {line.unitPrice != null ? ` · ${money(line.unitPrice)}` : null}
                        </p>
                      </div>
                      {line.unitPrice != null ? (
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-navy)]">
                          {money(line.unitPrice * line.quantity)}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2.5">
                      <QuantityStepper
                        value={line.quantity}
                        label={line.name}
                        disabled={pending}
                        onChange={(quantity) => update(line, { quantity })}
                        onRemove={() => remove(line)}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-[var(--sidebar-border)] bg-background px-4 py-4">
        <CartSummary summary={summary} variant="compact" />

        <Button
          className="mt-4 h-11 w-full rounded-[2px] btn-brand font-semibold text-white"
          disabled={(lines.length === 0 && canOrder) || pending}
          data-state={pending ? "loading" : undefined}
          onClick={requestCheckout}
        >
          {pending ? t("common.saving") : t("storefront.confirmCart")}
        </Button>

        {canOrder && lines.length > 0 ? (
          <Link
            href="/cart"
            className="mt-2 block py-2 text-center text-sm font-medium text-[var(--brand-navy)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {t("storefront.fullCheckout")}
          </Link>
        ) : null}
      </footer>
    </aside>
  )
}
