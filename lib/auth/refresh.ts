import { getApiBaseUrl } from "@/lib/api/config"
import {
  extractRefreshTokenFromSetCookie,
  parseSetCookieHeaders,
  type SessionCookiePayload,
} from "@/lib/auth/session"

/** Refresh access this many seconds before JWT exp to avoid race on slow pages */
export const ACCESS_REFRESH_SKEW_SEC = 60

export type RefreshedSession = SessionCookiePayload

/** Decode JWT payload without verifying — only used to read `exp`. */
export function readJwtExp(token: string): number | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    )
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8")
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

/** True when missing/invalid or past exp (with skew). */
export function isAccessTokenExpired(
  token: string | null | undefined,
  skewSeconds = ACCESS_REFRESH_SKEW_SEC
): boolean {
  if (!token) return true
  const exp = readJwtExp(token)
  if (exp == null) return true
  return exp * 1000 <= Date.now() + skewSeconds * 1000
}

/**
 * Call backend refresh. Prefers refreshToken in JSON (reliable for BFF);
 * falls back to Set-Cookie parse for older backends.
 */
export async function callRefreshApi(
  refreshToken: string
): Promise<RefreshedSession | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
    if (!res.ok) return null

    const json = (await res.json().catch(() => null)) as {
      success?: boolean
      data?: {
        accessToken?: string
        refreshToken?: string
        user?: Record<string, unknown>
      }
    } | null

    const accessToken = json?.data?.accessToken
    if (!accessToken) return null

    const setCookies = parseSetCookieHeaders(
      res.headers.get("set-cookie"),
      () =>
        typeof res.headers.getSetCookie === "function"
          ? res.headers.getSetCookie()
          : []
    )
    const fromCookie = extractRefreshTokenFromSetCookie(setCookies)
    const nextRefresh =
      json.data?.refreshToken?.trim() || fromCookie || refreshToken

    return {
      accessToken,
      refreshToken: nextRefresh,
      user: json.data?.user ?? null,
    }
  } catch {
    return null
  }
}
