"use client"

import Link from "next/link"
import { useTransition } from "react"
import { Minus, Plus } from "lucide-react"

import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import type { CartLine, CartPricing } from "@/lib/api/cart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StorefrontCartPanelProps = {
  lines: CartLine[]
  businessId: string | null
  pricing?: CartPricing | null
  className?: string
}

export function StorefrontCartPanel({
  lines,
  businessId,
  pricing,
  className,
}: StorefrontCartPanelProps) {
  const t = useT()
  const { requestCheckout, canOrder, openAuthGate, isAuthenticated } =
    useAuthGate()
  const [pending, startTransition] = useTransition()

  const subtotal = lines.reduce((sum, line) => {
    if (line.unitPrice == null) return sum
    return sum + line.unitPrice * line.quantity
  }, 0)
  const total = pricing?.grandTotal ?? subtotal
  const currency = lines[0]?.currency ?? "GBP"
  const money = (n: number) =>
    currency === "GBP" ? `£${n.toFixed(2)}` : `${n.toFixed(2)} ${currency}`

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)

  const bump = (line: CartLine, delta: number) => {
    if (!businessId || pending) return
    const next = line.quantity + delta
    startTransition(async () => {
      if (next < 1) {
        notifyActionResult(
          await removeCartItemAction(businessId, line.id),
          t("storefront.removed")
        )
      } else {
        notifyActionResult(
          await updateCartItemAction(businessId, line.id, { quantity: next }),
          t("storefront.updated")
        )
      }
    })
  }

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col bg-background text-[var(--brand-navy)]",
        className
      )}
    >
      <header className="shrink-0 border-b border-[var(--sidebar-border)] px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
            {t("storefront.yourCart")}
          </h2>
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
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-full items-center justify-center text-[10px] font-semibold uppercase text-muted-foreground"
                        aria-hidden
                      >
                        {line.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-snug text-[var(--brand-navy)]">
                          {line.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {line.unit}
                          {line.unitPrice != null
                            ? ` · ${money(line.unitPrice)}`
                            : null}
                        </p>
                      </div>
                      {line.unitPrice != null ? (
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--brand-navy)]">
                          {money(line.unitPrice * line.quantity)}
                        </span>
                      ) : null}
                    </div>

                    <div
                      className="mt-2.5 inline-flex overflow-hidden rounded-[2px] border border-[var(--sidebar-border)]"
                      role="group"
                      aria-label={line.name}
                    >
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-8 rounded-none border-r border-[var(--sidebar-border)] hover:bg-muted/60"
                        disabled={pending}
                        aria-label={`− ${line.name}`}
                        onClick={() => bump(line, -1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span
                        className="flex min-w-9 items-center justify-center bg-background text-sm font-semibold tabular-nums"
                        aria-live="polite"
                      >
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="size-8 rounded-none border-l border-[var(--sidebar-border)] hover:bg-muted/60"
                        disabled={pending}
                        aria-label={`+ ${line.name}`}
                        onClick={() => bump(line, 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-[var(--sidebar-border)] bg-background px-4 py-4">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4 text-muted-foreground">
            <dt>{t("storefront.subtotal")}</dt>
            <dd className="font-medium tabular-nums text-[var(--brand-navy)]">
              {money(subtotal)}
            </dd>
          </div>
          {pricing && pricing.totalDiscount > 0 ? (
            <div className="flex justify-between gap-4 text-muted-foreground">
              <dt>{t("promotions.discount")}</dt>
              <dd className="tabular-nums">-{money(pricing.totalDiscount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-[var(--sidebar-border)] pt-2 text-base font-semibold text-[var(--brand-navy)]">
            <dt>{t("storefront.total")}</dt>
            <dd className="tabular-nums">{money(total)}</dd>
          </div>
        </dl>

        <Button
          className="mt-4 h-11 w-full rounded-[2px] btn-brand font-semibold text-white"
          disabled={(lines.length === 0 && canOrder) || pending}
          data-state={pending ? "loading" : undefined}
          onClick={() => {
            if (!isAuthenticated) {
              openAuthGate({ intent: "checkout", tab: "login" })
              return
            }
            requestCheckout()
          }}
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
