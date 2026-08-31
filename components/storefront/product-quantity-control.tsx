"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MAX_QTY = 999

type ProductQuantityControlProps = {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
  name?: string
}

function clampQty(value: number) {
  return Math.max(0, Math.min(MAX_QTY, value))
}

export function ProductQuantityControl({
  value,
  onChange,
  disabled = false,
  className,
  name = "quantity",
}: ProductQuantityControlProps) {
  const t = useT()
  const [input, setInput] = useState(String(value))

  const commit = (raw: string) => {
    const digits = raw.replace(/\D/g, "")
    if (!digits) {
      setInput("0")
      onChange(0)
      return
    }
    const next = clampQty(parseInt(digits, 10))
    setInput(String(next))
    onChange(next)
  }

  return (
    <div
      className={cn(
        "inline-flex overflow-hidden border border-[var(--sidebar-border)]",
        className
      )}
      role="group"
      aria-label={t("storefront.quantity")}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="size-9 rounded-none border-r border-[var(--sidebar-border)] hover:bg-muted/60"
        disabled={disabled || value <= 0}
        onClick={() => {
          const next = clampQty(value - 1)
          setInput(String(next))
          onChange(next)
        }}
      >
        <Minus className="size-3.5" />
      </Button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        name={name}
        autoComplete="off"
        disabled={disabled}
        value={input}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "")
          setInput(next)
          if (next !== "") {
            onChange(clampQty(parseInt(next, 10)))
          }
        }}
        onBlur={() => commit(input)}
        className="h-9 w-14 border-0 bg-background text-center text-sm font-semibold tabular-nums text-[var(--brand-navy)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] disabled:opacity-50"
        aria-label={t("storefront.quantity")}
      />
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="size-9 rounded-none border-l border-[var(--sidebar-border)] hover:bg-muted/60"
        disabled={disabled || value >= MAX_QTY}
        onClick={() => {
          const next = clampQty(value + 1)
          setInput(String(next))
          onChange(next)
        }}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
