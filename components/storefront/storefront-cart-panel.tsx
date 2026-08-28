"use client"

import Link from "next/link"
import { useTransition } from "react"
import { Minus, Plus, ShoppingBasket } from "lucide-react"

import {
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import type { CartLine } from "@/lib/api/cart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StorefrontCartPanelProps = {
  lines: CartLine[]
  businessId: string | null
  className?: string
}

export function StorefrontCartPanel({
  lines,
  businessId,
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
  const currency = lines[0]?.currency ?? "GBP"
  const money = (n: number) =>
    currency === "GBP" ? `£${n.toFixed(2)}` : `${n.toFixed(2)} ${currency}`

  const bump = (line: CartLine, delta: number) => {
    if (!businessId) return
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
    <aside className={cn("flex h-full flex-col border-l bg-white", className)}>
      <div className="border-b px-4 py-4">
        <h2 className="text-base font-semibold text-[var(--brand-navy)]">
          {t("storefront.yourCart")}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {lines.length === 0 ? (
          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 px-4 text-center">
            <ShoppingBasket className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {t("storefront.cartEmpty")}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.id}
                className="rounded-xl border p-3"
              >
                <div className="flex gap-2">
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.unit}
                      {line.unitPrice != null
                        ? ` · ${money(line.unitPrice)}`
                        : null}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => bump(line, -1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => bump(line, 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  {line.unitPrice != null ? (
                    <span className="text-sm font-semibold tabular-nums">
                      {money(line.unitPrice * line.quantity)}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("storefront.subtotal")}</span>
          <span className="font-medium tabular-nums">{money(subtotal)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>{t("storefront.total")}</span>
          <span className="tabular-nums">{money(subtotal)}</span>
        </div>
        <Button
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={lines.length === 0 && canOrder}
          onClick={() => {
            if (!isAuthenticated) {
              openAuthGate({ intent: "checkout", tab: "login" })
              return
            }
            requestCheckout()
          }}
        >
          {t("storefront.confirmCart")}
        </Button>
        {canOrder && lines.length > 0 ? (
          <Link
            href="/cart"
            className="block w-full rounded-lg py-2 text-center text-sm font-medium text-primary hover:underline"
          >
            {t("storefront.fullCheckout")}
          </Link>
        ) : null}
      </div>
    </aside>
  )
}
