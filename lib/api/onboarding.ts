import { cookies } from "next/headers"

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  USER_COOKIE,
  ACCESS_MAX_AGE_SEC,
  REFRESH_MAX_AGE_SEC,
  cookieOptions,
  extractRefreshTokenFromSetCookie,
  parseSetCookieHeaders,
} from "@/lib/auth/session"
import { getApiBaseUrl } from "@/lib/api/config"
import { apiFetch } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"
import { mapUser } from "@/lib/mappers"
import type { User } from "@/lib/types"

async function persistAuthResponse(res: Response, json: {
  data?: {
    accessToken?: string
    refreshToken?: string
    user?: Record<string, unknown>
  }
}) {
  if (!json.data?.accessToken || !json.data.user) {
    throw new ApiError("Invalid auth response", res.status || 500)
  }

  const setCookies = parseSetCookieHeaders(
    res.headers.get("set-cookie"),
    () =>
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : []
  )
  const refreshFromCookie = extractRefreshTokenFromSetCookie(setCookies)
  const refreshToken =
    json.data.refreshToken?.trim() || refreshFromCookie || null

  const jar = await cookies()
  jar.set(ACCESS_COOKIE, json.data.accessToken, cookieOptions(ACCESS_MAX_AGE_SEC))
  if (refreshToken) {
    jar.set(REFRESH_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE_SEC))
  }
  jar.set(
    USER_COOKIE,
    JSON.stringify(json.data.user),
    cookieOptions(REFRESH_MAX_AGE_SEC)
  )

  return mapUser(json.data.user)
}

export async function registerWithPassword(input: {
  firstName: string
  lastName?: string
  email: string
  password: string
  phone: string
  receiveAnnouncements?: boolean
}): Promise<User> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  })

  const json = (await res.json().catch(() => null)) as {
    success?: boolean
    message?: string
    data?: {
      accessToken?: string
      refreshToken?: string
      user?: Record<string, unknown>
    }
  } | null

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message || "Registration failed", res.status || 400)
  }

  return persistAuthResponse(res, json)
}

export async function verifyEmailCode(input: {
  code: string
  email?: string
}): Promise<User> {
  const data = await apiFetch<{ user: Record<string, unknown> }>(
    "/api/auth/verify-email",
    { method: "POST", body: input }
  )
  const user = mapUser(data.user)
  const jar = await cookies()
  jar.set(USER_COOKIE, JSON.stringify(data.user), cookieOptions(REFRESH_MAX_AGE_SEC))
  return user
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
