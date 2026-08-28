import { cache } from "react"
import { cookies } from "next/headers"

import { apiFetch } from "@/lib/api/client"
import { getSessionUser } from "@/lib/api/auth"
import {
  getMyBusinesses,
  type MerchantBusiness,
} from "@/lib/api/businesses"
import { BUSINESS_COOKIE } from "@/lib/auth/session"
import { mapUser } from "@/lib/mappers"
import type { TeamPermission, User } from "@/lib/types"

export type BusinessContext = {
  user: User
  businesses: Array<MerchantBusiness & { permissions: TeamPermission[] }>
  active: MerchantBusiness & { permissions: TeamPermission[] }
}

/**
 * İstek başına bir kez çözümlenir. Aktif işletme rl_business_id cookie'sinden
 * seçilir; cookie yoksa/stale ise ilk işletme kullanılır.
 */
export const getBusinessContext = cache(async (): Promise<BusinessContext | null> => {
  let user = await getSessionUser()
  if (!user) return null

  let businesses: Awaited<ReturnType<typeof getMyBusinesses>>
  try {
    businesses = await getMyBusinesses()
  } catch (error) {
    const status = (error as { status?: number }).status
    if (status === 401) return null
    // Token geçersiz değilse cookie'deki kullanıcıyla devam etmeyi denemeye gerek yok
    throw error
  }

  if (!user.id) {
    try {
      const me = await apiFetch<{ user: Record<string, unknown> }>("/api/users/me")
      user = mapUser(me.user)
    } catch {
      return null
    }
  }

  if (!businesses.length) return null

  const jar = await cookies()
  const selectedId = jar.get(BUSINESS_COOKIE)?.value
  const active =
    businesses.find((business) => business.id === selectedId) ?? businesses[0]

  return { user, businesses, active }
})
