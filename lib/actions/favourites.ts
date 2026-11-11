"use server"

import { redirect } from "next/navigation"

import { addLinesToCart } from "@/lib/api/cart"
import { getFavorites, removeFavoriteItem, updateFavoriteItem } from "@/lib/api/favorites"
import { actionError, refreshAllPages } from "@/lib/actions/result"

/** Quantity changes on a favourite line. Steppers never send less than 1; removing has its own action. */
export async function updateFavoriteItemAction(
  businessId: string,
  listId: string,
  itemId: string,
  input: { quantity?: number; unit?: string }
) {
  try {
    await updateFavoriteItem(businessId, listId, itemId, input)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeFavoriteItemAction(businessId: string, listId: string, itemId: string) {
  try {
    await removeFavoriteItem(businessId, listId, itemId)
    refreshAllPages()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

/** "Add all": every favourite line, with its quantity and unit, into the cart. */
export async function addAllFavoritesToCartAction(businessId: string, options?: { redirectToCart?: boolean }) {
  let added = 0
  try {
    const { items } = await getFavorites(businessId)
    added = await addLinesToCart(businessId, items)
    refreshAllPages()
  } catch (error) {
    return actionError(error)
  }
  if (added === 0) return { error: "No items could be added — products may be unavailable" }
  if (options?.redirectToCart) redirect("/cart")
  return { success: true as const, added }
}
