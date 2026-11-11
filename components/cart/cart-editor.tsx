"use client"

import { useState, useTransition } from "react"

import { ProductImage } from "@/components/brand/product-image"
import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { useCartLine } from "@/components/cart/use-cart-line"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { notifyActionResult } from "@/lib/action-toast"
import { clearCartAction } from "@/lib/actions/cart"
import type { CartLine } from "@/lib/api/cart"

/** The cart page's line list: unit, quantity and a note per line. */
export function CartEditor({ businessId, lines }: { businessId: string; lines: CartLine[] }) {
  const t = useT()
  const { pending, update, remove } = useCartLine(businessId)
  const [clearing, startClearing] = useTransition()
  const busy = pending || clearing

  return (
    <>
      <ul className="divide-y divide-[var(--border-subtle)]">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-[#f3f4f6]">
                <ProductImage src={line.imageUrl} name={line.name} className="text-lg" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-[var(--brand-navy)]">{line.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {[line.brand, line.packSize].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={line.unit} onValueChange={(unit) => unit && update(line, { unit })}>
                    <SelectTrigger size="sm" className="h-9 w-[92px] rounded-[2px] border-[var(--border-subtle)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2px]">
                      {line.packagingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <QuantityStepper
                    value={line.quantity}
                    label={line.name}
                    disabled={busy}
                    onChange={(quantity) => update(line, { quantity })}
                    onRemove={() => remove(line)}
                  />
                </div>
                <LineNote line={line} disabled={busy} onSave={(comment) => update(line, { comment })} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          className="rounded-[2px] border-[var(--border-subtle)] text-[var(--brand-navy)]"
          onClick={() => {
            if (!window.confirm(t("cart.clearConfirm"))) return
            startClearing(async () => {
              notifyActionResult(await clearCartAction(businessId), t("cart.cleared"))
            })
          }}
        >
          {t("cart.clearCart")}
        </Button>
      </div>
    </>
  )
}

/** Saved on blur, only when it changed; an emptied note is cleared. */
function LineNote({
  line,
  disabled,
  onSave,
}: {
  line: CartLine
  disabled: boolean
  onSave: (comment: string | null) => void
}) {
  const t = useT()
  const [value, setValue] = useState(line.comment ?? "")
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={t("cart.lineNotePlaceholder")}
      className="h-9 rounded-[2px] border-[var(--border-subtle)] text-sm focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
      disabled={disabled}
      onBlur={() => {
        const next = value.trim() || null
        if (next !== (line.comment || null)) onSave(next)
      }}
    />
  )
}
