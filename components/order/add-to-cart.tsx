"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"

import { addCartItemAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

type AddToCartProps = {
  businessId: string
  productId: string
  packagingOptions: string[]
  compact?: boolean
}

export function AddToCart({
  businessId,
  productId,
  packagingOptions,
  compact = false,
}: AddToCartProps) {
  const [unit, setUnit] = useState(packagingOptions[0] ?? "EACH")
  const [quantity, setQuantity] = useState("1")
  const [pending, startTransition] = useTransition()

  const add = () => {
    const qty = Math.max(1, Number(quantity) || 1)
    startTransition(async () => {
      notifyActionResult(
        await addCartItemAction(businessId, {
          productId,
          quantity: qty,
          unit,
        }),
        "Added to cart"
      )
    })
  }

  return (
    <div className="flex items-center gap-1.5">
      {!compact ? (
        <Select value={unit} onValueChange={(value) => setUnit(value ?? "EACH")}>
          <SelectTrigger
            size="sm"
            className="h-8 w-[86px] rounded-[2px] border-[var(--sidebar-border)]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-[2px]">
            {(packagingOptions.length ? packagingOptions : ["EACH"]).map(
              (option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      ) : null}
      <Input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="h-8 w-[58px] rounded-[2px] border-[var(--sidebar-border)]"
        aria-label="Quantity"
      />
      <Button
        size="sm"
        disabled={pending}
        onClick={add}
        className="h-8 rounded-[2px] btn-brand text-white"
      >
        <Plus />
        <span className="sr-only sm:not-sr-only sm:inline">Add</span>
      </Button>
    </div>
  )
}
