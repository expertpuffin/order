import { apiUrl } from "@/lib/backend/config"
import { ApiError } from "@/lib/backend/errors"
import type { Session } from "@/lib/session/cookies"

/** Every backend endpoint that starts a session answers through utils/authSession.js. */
type SessionBody = {
  success?: boolean
  message?: string
  data?: { accessToken?: string; refreshToken?: string; user?: Record<string, unknown> }
}

async function postSession(path: string, body: unknown) {
  const res = await fetch(`${apiUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const json = (await res.json().catch(() => null)) as SessionBody | null
  return { res, json }
}

/** The backend also sets `refreshToken` as a cookie; the body is preferred because Set-Cookie across services is unreliable. */
function refreshTokenFromSetCookie(headers: Headers): string | null {
  const list = headers.getSetCookie?.() ?? []
  for (const header of list) {
    const match = header.match(/^refreshToken=([^;]+)/i)
    if (match?.[1]) return decodeURIComponent(match[1])
  }
  return null
}

/** Login, register and the business-panel handoff: a session with its user, or an ApiError. */
export async function requestSession(
  path: string,
  body: unknown,
  failure: string
): Promise<Session & { user: Record<string, unknown> }> {
  const { res, json } = await postSession(path, body)
  const data = json?.data
  if (!res.ok || !json?.success || !data?.accessToken || !data.user) {
    throw new ApiError(json?.message || failure, res.ok ? 500 : res.status)
  }
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken?.trim() || refreshTokenFromSetCookie(res.headers),
    user: data.user,
  }
}

/** A rotated session, or null when the refresh token is rejected or the API is unreachable. */
export async function refreshSession(refreshToken: string): Promise<Session | null> {
  try {
    const { res, json } = await postSession("/api/auth/refresh", { refreshToken })
    const accessToken = json?.data?.accessToken
    if (!res.ok || !accessToken) return null
    return {
      accessToken,
      refreshToken: json.data?.refreshToken?.trim() || refreshTokenFromSetCookie(res.headers) || refreshToken,
      user: json.data?.user ?? null,
    }
  } catch {
    return null
  }
}

export async function revokeSession(refreshToken: string | null) {
  try {
    await postSession("/api/auth/logout", refreshToken ? { refreshToken } : {})
  } catch {
    // Logging out locally still works when the API is unreachable
  }
}
