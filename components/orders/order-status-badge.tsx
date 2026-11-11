import { ApprovalBadge } from "@/components/orders/approval-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { isApprovalDraft, type Order } from "@/lib/order"

/** An order's state: where its manager approval stands while it waits for one, else its status. */
export function OrderStatusBadge({ order }: { order: Pick<Order, "status" | "managerApproval"> }) {
  return isApprovalDraft(order) && order.managerApproval ? (
    <ApprovalBadge state={order.managerApproval.state} />
  ) : (
    <StatusBadge status={order.status} />
  )
}
