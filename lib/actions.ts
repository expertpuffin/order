"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

import {
  addCartItem,
  checkoutCart,
  clearCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart"
import { cancelOrder, getOrder } from "@/lib/api/orders"
import {
  addFavoriteItem,
  getFavorites,
  removeFavoriteItem,
} from "@/lib/api/favorites"
import {
  BUSINESS_COOKIE,
  REFRESH_MAX_AGE_SEC,
  cookieOptions,
} from "@/lib/auth/session"
import { ApiError } from "@/lib/api/errors"

function formString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function actionError(error: unknown) {
  if (error instanceof ApiError) return { error: error.message }
  return { error: "Something went wrong" }
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = formString(formData, "email")
  const password = formString(formData, "password")
  const next = formString(formData, "next") || "/"

  const { loginWithPassword } = await import("@/lib/api/auth")
  try {
    await loginWithPassword(email, password)
  } catch (error) {
    return actionError(error)
  }
  redirect(next.startsWith("/") ? next : "/")
}

export async function logoutAction() {
  const { logoutSession } = await import("@/lib/api/auth")
  await logoutSession()
  redirect("/")
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const firstName = formString(formData, "firstName")
  const lastName = formString(formData, "lastName")
  const email = formString(formData, "email")
  const password = formString(formData, "password")
  const phone = formString(formData, "phone")
  const receiveAnnouncements = formData.get("receiveAnnouncements") !== "off"

  if (!firstName || !email || !password || !phone) {
    return { error: "All required fields must be filled" }
  }

  try {
    const { registerWithPassword } = await import("@/lib/api/onboarding")
    await registerWithPassword({
      firstName,
      lastName: lastName || undefined,
      email,
      password,
      phone,
      receiveAnnouncements,
    })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding")
}

export async function verifyEmailAction(_prev: unknown, formData: FormData) {
  const code = formString(formData, "code")
  const email = formString(formData, "email")
  if (!code || code.length < 6) {
    return { error: "Enter the 6-digit code" }
  }
  try {
    const { verifyEmailCode } = await import("@/lib/api/onboarding")
    await verifyEmailCode({ code, email: email || undefined })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding")
}

export async function resendVerificationAction() {
  try {
    const { resendVerificationEmail } = await import("@/lib/api/onboarding")
    await resendVerificationEmail()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function saveAcquisitionAction(_prev: unknown, formData: FormData) {
  const source = formString(formData, "source")
  const otherText = formString(formData, "otherText")
  if (!source) return { error: "Please select a source" }
  try {
    const { saveAcquisition } = await import("@/lib/api/onboarding")
    await saveAcquisition({
      source,
      otherText: otherText || undefined,
    })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding/business")
}

export async function createBusinessAction(_prev: unknown, formData: FormData) {
  const businessName = formString(formData, "businessName")
  const tradingName = formString(formData, "tradingName") || businessName
  const businessType = formString(formData, "businessType")
  const line1 = formString(formData, "line1")
  const line2 = formString(formData, "line2")
  const postTown = formString(formData, "postTown")
  const county = formString(formData, "county")
  const postcode = formString(formData, "postcode")
  const contactFirstName = formString(formData, "contactFirstName")
  const contactLastName = formString(formData, "contactLastName")
  const contactPhone = formString(formData, "contactPhone")
  const openTime = formString(formData, "openTime") || "09:00"
  const closeTime = formString(formData, "closeTime") || "22:00"
  const deliveryTime = formString(formData, "deliveryTime") || "11:00-13:00"

  if (!businessName || !businessType || !line1 || !postcode || !contactFirstName || !contactPhone) {
    return { error: "Please fill all required business fields" }
  }

  try {
    const { createBusinessApplication } = await import("@/lib/api/onboarding")
    await createBusinessApplication({
      businessName,
      tradingName,
      businessType,
      address: {
        line_1: line1,
        line_2: line2 || undefined,
        post_town: postTown || undefined,
        county: county || undefined,
        postcode,
      },
      contactFirstName,
      contactLastName: contactLastName || undefined,
      contactPhone,
      isOwner: true,
      openTime,
      closeTime,
      deliveryTime,
    })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding/pending")
}

export async function switchBusinessAction(businessId: string) {
  const jar = await cookies()
  jar.set(BUSINESS_COOKIE, businessId, cookieOptions(REFRESH_MAX_AGE_SEC))
  revalidatePath("/", "layout")
}

export async function addCartItemAction(
  businessId: string,
  input: {
    productId: string
    quantity?: number
    unit?: string
    offerId?: string
  }
) {
  try {
    await addCartItem(businessId, input)
    revalidatePath("/cart")
    revalidatePath("/")
    revalidatePath("/catalog")
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
    revalidatePath("/cart")
    revalidatePath("/")
    revalidatePath("/catalog")
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function removeCartItemAction(businessId: string, itemId: string) {
  try {
    await removeCartItem(businessId, itemId)
    revalidatePath("/cart")
    revalidatePath("/")
    revalidatePath("/catalog")
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function clearCartAction(businessId: string) {
  try {
    await clearCart(businessId)
    revalidatePath("/cart")
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

/** Sepeti tedarikçi gruplarına bölerek siparişe çevirir */
export async function checkoutAction(_prev: unknown, formData: FormData) {
  const businessId = formString(formData, "businessId")
  const requestedDeliveryDate = formString(formData, "requestedDeliveryDate")
  if (!businessId || !requestedDeliveryDate) {
    return { error: "Delivery date is required" }
  }

  let orders
  try {
    orders = await checkoutCart(businessId, {
      requestedDeliveryDate,
      fulfillmentMethod:
        formString(formData, "fulfillmentMethod") === "collection"
          ? "collection"
          : "delivery",
      deliveryTime: formString(formData, "deliveryTime") || null,
      specialNote: formString(formData, "specialNote") || null,
    })
  } catch (error) {
    return actionError(error)
  }

  revalidatePath("/orders")
  revalidatePath("/cart")
  if (orders.length === 1) {
    redirect(`/orders/${orders[0].orderNumber}?placed=1`)
  }
  redirect(`/orders?placed=${orders.length}`)
}

export async function toggleFavoriteAction(
  businessId: string,
  productId: string,
  favorited: boolean,
  favoriteItemId?: string
) {
  try {
    if (favorited && favoriteItemId) {
      const current = await getFavorites(businessId)
      if (current.listId) {
        await removeFavoriteItem(businessId, current.listId, favoriteItemId)
      }
      revalidatePath("/favourites")
      return { success: true as const, favorited: false }
    }

    const { listId } = await getFavorites(businessId)
    if (!listId) return { error: "Could not open favourites list" }
    await addFavoriteItem(businessId, listId, productId)
    revalidatePath("/favourites")
    return { success: true as const, favorited: true }
  } catch (error) {
    return actionError(error)
  }
}

/** Sipariş kalemlerini sepete geri kopyalar */
export async function reorderOrderAction(
  businessId: string,
  orderNumber: string
) {
  try {
    const order = await getOrder(orderNumber)
    let added = 0
    for (const item of order.items) {
      if (!item.productId || item.quantity < 1) continue
      try {
        await addCartItem(businessId, {
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
        })
        added += 1
      } catch {
        // Ürün kaldırılmış olabilir — satırı atla
      }
    }
    revalidatePath("/cart")
    if (added > 0) return { success: true as const, added }
    return { error: "No items could be added — products may be unavailable" }
  } catch (error) {
    return actionError(error)
  }
}

export async function cancelOrderAction(orderNumber: string, note?: string) {
  try {
    await cancelOrder(orderNumber, note ?? "Cancelled by business")
    revalidatePath("/orders")
    revalidatePath(`/orders/${encodeURIComponent(orderNumber)}`)
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}
