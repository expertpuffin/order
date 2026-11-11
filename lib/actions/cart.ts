"use server"

import { cookies } from "next/headers"

import { addCartItem, applyCartCoupon, clearCart, removeCartItem, updateCartItem } from "@/lib/api/cart"
import { actionError, refreshAllPages } from "@/lib/actions/result"
import { setActiveBusiness } from "@/lib/business-context"

export async function switchBusinessAction(businessId: string) {
  setActiveBusiness(await cookies(), businessId)
  refreshAllPages()
}

export async function addCartItemAction(
  businessId: string,
  input: { productId: string; quantity?: number; unit?: string; offerId?: string }
) {
  try {
    await addCartItem(businessId, input)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function updateCartItemAction(
  businessId: string,
  itemId: string,
  input: { quantity?: number; unit?: string; comment?: string | null }
) {
  try {
    await updateCartItem(businessId, itemId, input)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeCartItemAction(businessId: string, itemId: string) {
  try {
    await removeCartItem(businessId, itemId)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function clearCartAction(businessId: string) {
  try {
    await clearCart(businessId)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function applyCartCouponAction(businessId: string, input: { code?: string; remove?: boolean }) {
  try {
    const data = await applyCartCoupon(businessId, input)
    refreshAllPages()
    return { success: true as const, couponError: data.couponError ?? null }
  } catch (error) {
    return actionError(error)
  }
}
