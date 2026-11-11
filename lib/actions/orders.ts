"use server"

import { addLinesToCart } from "@/lib/api/cart"
import { approvalToCart, cancelOrder, getOrder, withdrawApproval } from "@/lib/api/orders"
import { actionError, failure, refreshAllPages } from "@/lib/actions/result"
import { getTranslator } from "@/lib/i18n"

/** The order's lines back into the cart. */
export async function reorderOrderAction(businessId: string, orderNumber: string) {
  try {
    const order = await getOrder(orderNumber)
    const added = await addLinesToCart(businessId, order.items)
    refreshAllPages()
    if (added > 0) return { success: true as const, added }
    return failure("errors.nothingAdded")
  } catch (error) {
    return actionError(error)
  }
}

export async function cancelOrderAction(orderNumber: string, note?: string) {
  try {
    await cancelOrder(orderNumber, note ?? (await getTranslator()).t("orders.cancelNote"))
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

/** The person who asked takes back a request still waiting for a manager. */
export async function withdrawApprovalAction(orderNumber: string, version: number) {
  try {
    await withdrawApproval(orderNumber, version)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    // code APPROVAL_CHANGED: someone decided meanwhile; the page refreshes to show it
    return actionError(error)
  }
}

/** A declined / withdrawn request back into my cart. */
export async function approvalToCartAction(orderNumber: string) {
  try {
    await approvalToCart(orderNumber)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}
