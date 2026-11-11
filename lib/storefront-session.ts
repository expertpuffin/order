import { cache } from "react"

import { getCart, type CartLine, type CartPricing } from "@/lib/api/cart"
import { canOrderFor, getBusinessContext, isSessionExpired } from "@/lib/business-context"
import { getSessionUser } from "@/lib/session/cookies"
import type { User } from "@/lib/types"

export type StorefrontSession = {
  user: User | null
  businessId: string | null
  businessName: string | null
  businessPostcode: string | null
  businessStatus: string | null
  canOrder: boolean
  cartLines: CartLine[]
  cartPricing: CartPricing | null
  businesses: Array<{ id: string; name: string; postcode: string }>
}

function withoutBusiness(user: User | null): StorefrontSession {
  return {
    user,
    businessId: null,
    businessName: null,
    businessPostcode: null,
    businessStatus: null,
    canOrder: false,
    cartLines: [],
    cartPricing: null,
    businesses: [],
  }
}

export const getStorefrontSession = cache(async (): Promise<StorefrontSession> => {
  const user = await getSessionUser()
  if (!user) return withoutBusiness(null)

  const ctx = await getBusinessContext()
  // Stale user cookie but the backend rejected the session: logged out (sign-in
  // modal), not "no business yet" (→ /onboarding).
  if (!ctx) return withoutBusiness((await isSessionExpired()) ? null : user)

  const canOrder = canOrderFor(ctx.active)

  let cartLines: CartLine[] = []
  let cartPricing: CartPricing | null = null
  if (canOrder) {
    try {
      const cart = await getCart(ctx.active.id)
      cartLines = cart.lines
      cartPricing = cart.pricing
    } catch {
      // The header still renders; the cart page shows the real error
    }
  }

  return {
    user,
    businessId: ctx.active.id,
    businessName: ctx.active.tradingName || ctx.active.businessName,
    businessPostcode: ctx.active.postcode || null,
    businessStatus: ctx.active.status,
    canOrder,
    cartLines,
    cartPricing,
    businesses: ctx.businesses.map((business) => ({
      id: business.id,
      name: business.tradingName || business.businessName,
      postcode: business.postcode,
    })),
  }
})
