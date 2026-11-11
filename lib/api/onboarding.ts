import { cookies } from "next/headers"

import { apiFetch } from "@/lib/api/client"
import { mapUser } from "@/lib/mappers"
import { writeSessionUser } from "@/lib/session/cookies"
import { FALLBACK_TEAM_ROLE_NAMES } from "@/lib/team-roles"
import type { User } from "@/lib/types"

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

/** GET /api/roles (fallback /api/businesses/team-roles) — names for applicant role chips. */
export async function listTeamRoleNames(): Promise<string[]> {
  try {
    const data = await apiFetch<{
      names?: string[]
      roles?: Array<{ name?: string }>
    }>("/api/roles")
    if (data.names?.length) return data.names
    const fromRoles = (data.roles ?? [])
      .map((r) => r.name?.trim())
      .filter((n): n is string => Boolean(n))
    if (fromRoles.length) return fromRoles
  } catch {
    /* try business fallback */
  }

  try {
    const data = await apiFetch<{
      names?: string[]
      roles?: Array<{ name?: string }>
    }>("/api/businesses/team-roles")
    if (data.names?.length) return data.names
    const fromRoles = (data.roles ?? [])
      .map((r) => r.name?.trim())
      .filter((n): n is string => Boolean(n))
    if (fromRoles.length) return fromRoles
  } catch {
    /* use static fallback */
  }

  return [...FALLBACK_TEAM_ROLE_NAMES]
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
