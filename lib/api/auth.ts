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
  persistSessionCookies,
} from "@/lib/auth/session"
import { callRefreshApi } from "@/lib/auth/refresh"
import { getApiBaseUrl } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"
import { mapUser } from "@/lib/mappers"
import type { User } from "@/lib/types"

/**
 * Merchant paneller admin panel ile aynı hesabı kullanır:
 * /api/auth/login normal app hesaplarını da kabul eder (role "user" dahil).
 */
export async function loginWithPassword(email: string, password: string) {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
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

  if (!res.ok || !json?.success || !json.data?.accessToken || !json.data.user) {
    throw new ApiError(json?.message || "Login failed", res.status || 401)
  }

  const setCookies = parseSetCookieHeaders(
    res.headers.get("set-cookie"),
    () =>
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : []
  )
  const refreshFromCookie = extractRefreshTokenFromSetCookie(setCookies)
  // Prefer body refreshToken — Set-Cookie across services is unreliable
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

/**
 * Refresh access (and rotate refresh) into httpOnly cookies.
 * Returns new access token, or null if refresh failed.
 */
export async function refreshSession(): Promise<string | null> {
  const jar = await cookies()
  const refreshToken = jar.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return null

  const session = await callRefreshApi(refreshToken)
  if (!session) return null

  try {
    await persistSessionCookies(session)
  } catch {
    // cookies().set is illegal during RSC render — caller still gets the token
  }

  return session.accessToken
}

export async function logoutSession() {
  const jar = await cookies()
  const refreshToken = jar.get(REFRESH_COOKIE)?.value

  try {
    await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      cache: "no-store",
    })
  } catch {
    /* ignore network errors on logout */
  }

  // Explicit expire — jar.delete alone can leave cookies readable by proxy
  const clear = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
  jar.set(ACCESS_COOKIE, "", clear)
  jar.set(REFRESH_COOKIE, "", clear)
  jar.set(USER_COOKIE, "", clear)
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
  jar.delete(USER_COOKIE)
}

export async function getSessionUser(): Promise<User | null> {
  const jar = await cookies()
  const raw = jar.get(USER_COOKIE)?.value
  if (!raw) return null
  try {
    return mapUser(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return null
  }
}
