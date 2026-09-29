import { cookies } from "next/headers"

export const ACCESS_COOKIE = "rl_access_token"
export const REFRESH_COOKIE = "rl_refresh_token"
export const USER_COOKIE = "rl_user"
export const BUSINESS_COOKIE = "rl_business_id"

// Prod: ".ordoria.com" gibi ayarlanır → aynı oturum iki panelde de geçerli
const AUTH_COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN || undefined

export const ACCESS_MAX_AGE_SEC = 60 * 15
export const REFRESH_MAX_AGE_SEC = 60 * 60 * 24 * 7

const isProd = process.env.NODE_ENV === "production"

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
    ...(AUTH_COOKIE_DOMAIN ? { domain: AUTH_COOKIE_DOMAIN } : {}),
  }
}

export async function getAccessToken() {
  const jar = await cookies()
  return jar.get(ACCESS_COOKIE)?.value ?? null
}

export async function getRefreshToken() {
  const jar = await cookies()
  return jar.get(REFRESH_COOKIE)?.value ?? null
}

export async function getSessionUserJson() {
  const jar = await cookies()
  return jar.get(USER_COOKIE)?.value ?? null
}

export type SessionCookiePayload = {
  accessToken: string
  refreshToken: string | null
  user: Record<string, unknown> | null
}

/** Persist session into Next httpOnly cookies (Server Action / Route Handler). */
export async function persistSessionCookies(session: SessionCookiePayload) {
  const jar = await cookies()
  jar.set(ACCESS_COOKIE, session.accessToken, cookieOptions(ACCESS_MAX_AGE_SEC))
  if (session.refreshToken) {
    jar.set(
      REFRESH_COOKIE,
      session.refreshToken,
      cookieOptions(REFRESH_MAX_AGE_SEC)
    )
  }
  if (session.user) {
    jar.set(
      USER_COOKIE,
      JSON.stringify(session.user),
      cookieOptions(REFRESH_MAX_AGE_SEC)
    )
  }
}

/** Same cookie writes for NextResponse (proxy / redirects). */
export function applySessionToResponseCookies(
  response: {
    cookies: {
      set: (
        name: string,
        value: string,
        options: ReturnType<typeof cookieOptions>
      ) => void
    }
  },
  session: SessionCookiePayload
) {
  response.cookies.set(
    ACCESS_COOKIE,
    session.accessToken,
    cookieOptions(ACCESS_MAX_AGE_SEC)
  )
  if (session.refreshToken) {
    response.cookies.set(
      REFRESH_COOKIE,
      session.refreshToken,
      cookieOptions(REFRESH_MAX_AGE_SEC)
    )
  }
  if (session.user) {
    response.cookies.set(
      USER_COOKIE,
      JSON.stringify(session.user),
      cookieOptions(REFRESH_MAX_AGE_SEC)
    )
  }
}

/** Extract refreshToken value from Set-Cookie headers */
export function extractRefreshTokenFromSetCookie(
  setCookieHeaders: string[]
): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(/(?:^|,\s*)refreshToken=([^;]+)/i)
    if (match?.[1]) return decodeURIComponent(match[1])
  }
  return null
}

export function parseSetCookieHeaders(
  header: string | null,
  getSetCookie?: () => string[]
): string[] {
  if (typeof getSetCookie === "function") {
    try {
      const list = getSetCookie()
      if (list?.length) return list
    } catch {
      /* ignore */
    }
  }
  if (!header) return []
  // Basit split — refresh cookie tek alan
  return header.split(/,(?=\s*[^;]+=)/).map((s) => s.trim())
}
