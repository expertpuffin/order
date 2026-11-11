import { cookies } from "next/headers"

import { apiFetch } from "@/lib/api/client"
import { writeSessionUser } from "@/lib/session/cookies"
import { FALLBACK_TEAM_ROLE_NAMES } from "@/lib/team-roles"
import { mapUser, type User } from "@/lib/session/user"

export async function verifyEmailCode(input: {
  code: string
  email?: string
}): Promise<User> {
  const data = await apiFetch<{ user: Record<string, unknown> }>(
    "/api/auth/verify-email",
    { method: "POST", body: input }
  )
  writeSessionUser(await cookies(), data.user)
  return mapUser(data.user)
}

export async function resendVerificationEmail() {
  await apiFetch("/api/auth/resend-verification", { method: "POST" })
}

export async function saveAcquisition(input: {
  source: string
  otherText?: string
}) {
  await apiFetch("/api/users/me/acquisition", {
    method: "PATCH",
    body: input,
  })
}

export async function lookupPostcode(postcode: string) {
  return apiFetch<{
    addresses?: Array<{
      line_1?: string
      line_2?: string
      line_3?: string
      post_town?: string
      county?: string
      postcode?: string
      latitude?: number
      longitude?: number
    }>
  }>("/find", {
    method: "POST",
    body: { postcode },
    auth: false,
  })
}

/**
 * Role names for the applicant's role chips: the platform list, else the business
 * team-roles list, else the static list shared with the mobile app. An unavailable
 * list is not an error here — the form still works with the fallback.
 */
export async function listTeamRoleNames(): Promise<string[]> {
  for (const path of ["/api/roles", "/api/businesses/team-roles"]) {
    try {
      const data = await apiFetch<{ names?: string[]; roles?: Array<{ name?: string }> }>(path)
      const names = data.names?.length
        ? data.names
        : (data.roles ?? []).map((r) => r.name?.trim()).filter((n): n is string => Boolean(n))
      if (names.length) return names
    } catch {
      // Next source
    }
  }
  return FALLBACK_TEAM_ROLE_NAMES
}

export type CreateBusinessInput = {
  businessName: string
  tradingName: string
  businessType: string
  address: {
    line_1: string
    line_2?: string
    post_town?: string
    county?: string
    postcode: string
    latitude?: number
    longitude?: number
  }
  contactFirstName: string
  contactLastName?: string
  contactPhone: string
  mainBusinessEmail?: string
  mainBusinessPhone?: string
  isOwner?: boolean
  ownerDetails?: {
    firstName: string
    lastName?: string
    email: string
    phone?: string | null
  }
  applicantRole?: string
  openTime: string
  closeTime: string
  deliveryTime?: string | null
}

export async function createBusinessApplication(input: CreateBusinessInput) {
  return apiFetch<{ business: Record<string, unknown> }>("/api/businesses", {
    method: "POST",
    body: input,
  })
}

export async function fetchMeExtended(): Promise<{
  user: User
  acquisitionAnsweredAt: string | null
}> {
  const data = await apiFetch<{ user: Record<string, unknown> }>("/api/users/me")
  return {
    user: mapUser(data.user),
    acquisitionAnsweredAt: data.user.acquisitionAnsweredAt
      ? String(data.user.acquisitionAnsweredAt)
      : null,
  }
}
