"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, ShoppingCart, Undo2, XCircle } from "lucide-react"
import { toast } from "sonner"

import {
  approvalToCartAction,
  cancelOrderAction,
  reorderOrderAction,
  withdrawApprovalAction,
} from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import type { OrderManagerApproval } from "@/lib/types"

const CANCELLABLE = ["draft", "submitted", "sent", "confirmed"] as const

export function OrderActions({
  businessId,
  orderNumber,
  status,
  hasReorderableItems,
  managerApproval = null,
  isRequester = false,
}: {
  businessId: string
  orderNumber: string
  status: string
  hasReorderableItems: boolean
  managerApproval?: OrderManagerApproval | null
  isRequester?: boolean
}) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // A draft that went to a manager moves only through the approval actions.
  const approvalDraft = status === "draft" && managerApproval != null

  return (
    <div className="flex flex-wrap gap-2">
      {hasReorderableItems && !approvalDraft ? (
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
      {approvalDraft && managerApproval.state === "pending" && isRequester ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(t("approval.withdrawConfirm"))) return
            startTransition(async () => {
              const result = await withdrawApprovalAction(orderNumber, managerApproval.version)
              if ("error" in result) {
                toast.error(result.error === "APPROVAL_CHANGED" ? t("approval.conflict") : result.error)
                router.refresh()
                return
              }
              toast.success(t("approval.withdrawn"))
            })
          }}
        >
          <Undo2 data-icon="inline-start" />
          {t("approval.withdraw")}
        </Button>
      ) : null}
      {approvalDraft && ["rejected", "withdrawn"].includes(managerApproval.state) && isRequester ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              notifyActionResult(await approvalToCartAction(orderNumber), t("approval.toCartDone"))
            })
          }
        >
          <ShoppingCart data-icon="inline-start" />
          {t("approval.toCart")}
        </Button>
      ) : null}
      {!approvalDraft && (CANCELLABLE as readonly string[]).includes(status) ? (
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
