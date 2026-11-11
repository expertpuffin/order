import { cache } from "react"
import { cookies } from "next/headers"

import { apiFetch } from "@/lib/api/client"
import { getMyBusinesses, type MerchantBusiness } from "@/lib/api/businesses"
import { ApiError } from "@/lib/backend/errors"
import { mapUser } from "@/lib/mappers"
import { cookieOptions, getSessionUser, REFRESH_MAX_AGE_SEC, type CookieWriter } from "@/lib/session/cookies"
import type { TeamPermission, User } from "@/lib/types"

/** Shared with the business panel (same cookie domain), so both open on the same business. */
const ACTIVE_BUSINESS_COOKIE = "rl_business_id"

export function setActiveBusiness(jar: CookieWriter, businessId: string) {
  jar.set(ACTIVE_BUSINESS_COOKIE, businessId, cookieOptions(REFRESH_MAX_AGE_SEC))
}

type MemberBusiness = MerchantBusiness & { permissions: TeamPermission[] }

export type BusinessContext = {
  user: User
  businesses: MemberBusiness[]
  active: MemberBusiness
}

/** Who may put things in the cart and check out for a business. */
export function canOrderFor(business: MemberBusiness) {
  return business.status === "approved" && business.permissions.includes("orders")
}

type Resolved = { ctx: BusinessContext | null; sessionExpired: boolean }

/** Resolved once per request. The active business comes from its cookie, else the first one. */
const resolveBusinessContext = cache(async (): Promise<Resolved> => {
  let user = await getSessionUser()
  if (!user) return { ctx: null, sessionExpired: false }

  let businesses: MemberBusiness[]
  try {
    businesses = await getMyBusinesses()
  } catch (error) {
    // The backend rejected the session (refresh failed too): not "no business yet"
    if (error instanceof ApiError && error.status === 401) return { ctx: null, sessionExpired: true }
    throw error
  }

  // User cookies written before ids were stored
  if (!user.id) {
    try {
      const me = await apiFetch<{ user: Record<string, unknown> }>("/api/users/me")
      user = mapUser(me.user)
    } catch {
      return { ctx: null, sessionExpired: false }
    }
  }

  if (!businesses.length) return { ctx: null, sessionExpired: false }

  const selectedId = (await cookies()).get(ACTIVE_BUSINESS_COOKIE)?.value
  const active = businesses.find((business) => business.id === selectedId) ?? businesses[0]

  return { ctx: { user, businesses, active }, sessionExpired: false }
})

export const getBusinessContext = cache(
  async (): Promise<BusinessContext | null> => (await resolveBusinessContext()).ctx
)

/** True when the user cookie is present but the backend rejected the session (401). */
export const isSessionExpired = cache(
  async (): Promise<boolean> => (await resolveBusinessContext()).sessionExpired
)
