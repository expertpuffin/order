"use client"

import { useTransition } from "react"
import { RotateCcw, XCircle } from "lucide-react"

import { cancelOrderAction, reorderOrderAction } from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { Button } from "@/components/ui/button"

const CANCELLABLE = ["draft", "submitted", "sent", "confirmed"] as const

export function OrderActions({
  businessId,
  orderNumber,
  status,
  hasReorderableItems,
}: {
  businessId: string
  orderNumber: string
  status: string
  hasReorderableItems: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap gap-2">
      {hasReorderableItems ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              notifyActionResult(
                await reorderOrderAction(businessId, orderNumber),
                "Items added to cart"
              )
            })
          }
        >
          <RotateCcw data-icon="inline-start" />
          Reorder
        </Button>
      ) : null}
      {(CANCELLABLE as readonly string[]).includes(status) ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Cancel order ${orderNumber}?`)) return
            startTransition(async () => {
              notifyActionResult(
                await cancelOrderAction(orderNumber),
                "Order cancelled"
              )
            })
          }}
        >
          <XCircle data-icon="inline-start" />
          Cancel order
        </Button>
      ) : null}
    </div>
  )
}
