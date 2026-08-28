import { cache } from "react"

import { getSessionUser } from "@/lib/api/auth"
import { getCart, type CartLine } from "@/lib/api/cart"
import { getBusinessContext } from "@/lib/business-context"
import { hasTeamPermission } from "@/lib/permissions"
import type { User } from "@/lib/types"

export type StorefrontSession = {
  user: User | null
  businessId: string | null
  businessName: string | null
  businessPostcode: string | null
  businessStatus: string | null
  canOrder: boolean
  cartLines: CartLine[]
  businesses: Array<{ id: string; name: string; postcode: string }>
}

export const getStorefrontSession = cache(
  async (): Promise<StorefrontSession> => {
    const user = await getSessionUser()
    if (!user) {
      return {
        user: null,
        businessId: null,
        businessName: null,
        businessPostcode: null,
        businessStatus: null,
        canOrder: false,
        cartLines: [],
        businesses: [],
      }
    }

    const ctx = await getBusinessContext()
    if (!ctx) {
      return {
        user,
        businessId: null,
        businessName: null,
        businessPostcode: null,
        businessStatus: null,
        canOrder: false,
        cartLines: [],
        businesses: [],
      }
    }

    const canOrder =
      ctx.active.status === "approved" &&
      hasTeamPermission(ctx.active.permissions, "orders")

    let cartLines: CartLine[] = []
    if (canOrder) {
      try {
        const cart = await getCart(ctx.active.id)
        cartLines = cart.lines
      } catch {
        cartLines = []
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
      businesses: ctx.businesses.map((business) => ({
        id: business.id,
        name: business.tradingName || business.businessName,
        postcode: business.postcode,
      })),
    }
  }
)
