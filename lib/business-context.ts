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

type Resolved = { ctx: BusinessContext | null; sessionExpired: boolean }

/**
 * İstek başına bir kez çözümlenir. Aktif işletme rl_business_id cookie'sinden
 * seçilir; cookie yoksa/stale ise ilk işletme kullanılır.
 */
const resolveBusinessContext = cache(async (): Promise<Resolved> => {
  let user = await getSessionUser()
  if (!user) return { ctx: null, sessionExpired: false }

  let businesses: Awaited<ReturnType<typeof getMyBusinesses>>
  try {
    businesses = await getMyBusinesses()
  } catch (error) {
    const status = (error as { status?: number }).status
    // Oturum backend'de ölmüş (refresh de başarısız) — "işletmesi yok" değil
    if (status === 401) return { ctx: null, sessionExpired: true }
    // Token geçersiz değilse cookie'deki kullanıcıyla devam etmeyi denemeye gerek yok
    throw error
  }

  if (!user.id) {
    try {
      const me = await apiFetch<{ user: Record<string, unknown> }>("/api/users/me")
      user = mapUser(me.user)
    } catch {
      return { ctx: null, sessionExpired: false }
    }
  }

  if (!businesses.length) return { ctx: null, sessionExpired: false }

  const jar = await cookies()
  const selectedId = jar.get(BUSINESS_COOKIE)?.value
  const active =
    businesses.find((business) => business.id === selectedId) ?? businesses[0]

  return { ctx: { user, businesses, active }, sessionExpired: false }
})

export const getBusinessContext = cache(
  async (): Promise<BusinessContext | null> =>
    (await resolveBusinessContext()).ctx
)

/** True when the rl_user cookie is present but the backend rejected the session (401). */
export const isSessionExpired = cache(
  async (): Promise<boolean> => (await resolveBusinessContext()).sessionExpired
)
