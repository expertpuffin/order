"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MAX_QTY = 999

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  /**
   * Called when minus is pressed at `min`. Lines in a cart or list pass one (the
   * line goes, with an undo); a quantity being chosen leaves it out and stops at `min`.
   */
  onRemove?: () => void
  min?: number
  /** Lets the quantity be typed, not just stepped */
  editable?: boolean
  disabled?: boolean
  label?: string
  size?: "sm" | "md"
}

/** Controlled: shows `value`, reports changes; a typed draft lives only while the field has focus. */
export function QuantityStepper({
  value,
  onChange,
  onRemove,
  min = 1,
  editable = false,
  disabled = false,
  label,
  size = "sm",
}: QuantityStepperProps) {
  const t = useT()
  const [draft, setDraft] = useState<string | null>(null)
  const clamp = (n: number) => Math.max(min, Math.min(MAX_QTY, n))
  const cell = size === "md" ? "size-9" : "size-8"

  const commit = () => {
    if (draft == null) return
    const typed = parseInt(draft, 10)
    setDraft(null)
    if (Number.isFinite(typed) && clamp(typed) !== value) onChange(clamp(typed))
  }

  return (
    <div
      className="inline-flex overflow-hidden rounded-[2px] border border-[var(--border-subtle)]"
      role="group"
      aria-label={label ?? t("storefront.quantity")}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className={cn(cell, "rounded-none border-r border-[var(--border-subtle)] hover:bg-muted/60")}
        disabled={disabled || (value <= min && !onRemove)}
        aria-label={t("cart.decreaseQty")}
        onClick={() => (value <= min ? onRemove?.() : onChange(value - 1))}
      >
        <Minus className="size-3.5" />
      </Button>
      {editable ? (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          disabled={disabled}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit()
          }}
          className={cn(
            size === "md" ? "h-9 w-14" : "h-8 w-12",
            "border-0 bg-background text-center text-sm font-semibold tabular-nums text-[var(--brand-navy)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] disabled:opacity-50"
          )}
          aria-label={label ?? t("storefront.quantity")}
        />
      ) : (
        <span
          className="flex min-w-9 items-center justify-center bg-background text-sm font-semibold tabular-nums text-[var(--brand-navy)]"
          aria-live="polite"
        >
          {value}
        </span>
      )}
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className={cn(cell, "rounded-none border-l border-[var(--border-subtle)] hover:bg-muted/60")}
        disabled={disabled || value >= MAX_QTY}
        aria-label={t("cart.increaseQty")}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
