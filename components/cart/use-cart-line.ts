"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { useT } from "@/components/i18n/i18n-provider"
import { notifyActionResult } from "@/lib/action-toast"
import { addCartItemAction, removeCartItemAction, updateCartItemAction } from "@/lib/actions/cart"
import type { CartLine } from "@/lib/api/cart"

/** Quantity, unit and note changes on cart lines; removing a line offers an undo instead of asking first. */
export function useCartLine(businessId: string | null) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  const update = (line: CartLine, input: { quantity?: number; unit?: string; comment?: string | null }) => {
    if (!businessId) return
    startTransition(async () => {
      notifyActionResult(await updateCartItemAction(businessId, line.id, input), t("storefront.updated"))
    })
  }

  const remove = (line: CartLine) => {
    if (!businessId) return
    startTransition(async () => {
      const result = await removeCartItemAction(businessId, line.id)
      if ("error" in result) {
        notifyActionResult(result)
        return
      }
      toast.success(t("storefront.removed"), {
        action: {
          label: t("common.undo"),
          onClick: () =>
            startTransition(async () => {
              notifyActionResult(
                await addCartItemAction(businessId, {
                  productId: line.productId,
                  quantity: line.quantity,
                  unit: line.unit,
                }),
                t("storefront.restored")
              )
            }),
        },
      })
    })
  }

  return { pending, update, remove }
}
