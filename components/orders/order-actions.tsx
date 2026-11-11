"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, ShoppingCart, Undo2, XCircle } from "lucide-react"
import { toast } from "sonner"

import { approvalToCartAction, cancelOrderAction, reorderOrderAction, withdrawApprovalAction } from "@/lib/actions/orders"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { ERROR_CODES } from "@/lib/domain"
import { isApprovalDraft, isCancellable, type OrderManagerApproval, type OrderStatus } from "@/lib/order"

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
  status: OrderStatus
  hasReorderableItems: boolean
  managerApproval?: OrderManagerApproval | null
  isRequester?: boolean
}) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const order = { status, managerApproval }
  // A draft that went to a manager moves only through the approval actions
  const approval = isApprovalDraft(order) ? managerApproval : null

  return (
    <div className="flex flex-wrap gap-2">
      {hasReorderableItems && !approval ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              notifyActionResult(
                await reorderOrderAction(businessId, orderNumber),
                t("orders.reordered")
              )
            })
          }
        >
          <RotateCcw data-icon="inline-start" />
          {t("orders.reorder")}
        </Button>
      ) : null}
      {approval?.state === "pending" && isRequester ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(t("approval.withdrawConfirm"))) return
            startTransition(async () => {
              const result = await withdrawApprovalAction(orderNumber, approval.version)
              if ("error" in result) {
                toast.error(result.code === ERROR_CODES.approvalChanged ? t("approval.conflict") : result.error)
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
      {approval && ["rejected", "withdrawn"].includes(approval.state) && isRequester ? (
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
      {isCancellable(order) ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(t("orders.cancelConfirm", { number: orderNumber }))) return
            startTransition(async () => {
              notifyActionResult(
                await cancelOrderAction(orderNumber),
                t("orders.cancelled")
              )
            })
          }}
        >
          <XCircle data-icon="inline-start" />
          {t("orders.cancel")}
        </Button>
      ) : null}
    </div>
  )
}
