import { cookies } from "next/headers"

import { mapUser } from "@/lib/mappers"
import type { User } from "@/lib/types"

const ACCESS_COOKIE = "rl_access_token"
const REFRESH_COOKIE = "rl_refresh_token"
const USER_COOKIE = "rl_user"

const ACCESS_MAX_AGE_SEC = 60 * 15
export const REFRESH_MAX_AGE_SEC = 60 * 60 * 24 * 7

// Prod sets ".ordoria.com" so one session works on both the order and business
// panels. Every write and every clear must carry it: a cookie cleared without the
// domain survives.
const AUTH_COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN || undefined

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
    ...(AUTH_COOKIE_DOMAIN ? { domain: AUTH_COOKIE_DOMAIN } : {}),
  }
}

export type Session = {
  accessToken: string
  refreshToken: string | null
  /** Raw backend user, stored as-is so every reader maps it the same way. */
  user: Record<string, unknown> | null
}

/** `cookies()` from next/headers and `NextResponse.cookies` both fit. */
export type CookieWriter = {
  set: (name: string, value: string, options: ReturnType<typeof cookieOptions>) => unknown
}

/** Readable from a request (proxy) as well as from `cookies()`. */
type CookieReader = { get: (name: string) => { value: string } | undefined }

export function writeSession(jar: CookieWriter, session: Session) {
  jar.set(ACCESS_COOKIE, session.accessToken, cookieOptions(ACCESS_MAX_AGE_SEC))
  if (session.refreshToken) {
    jar.set(REFRESH_COOKIE, session.refreshToken, cookieOptions(REFRESH_MAX_AGE_SEC))
  }
  if (session.user) writeSessionUser(jar, session.user)
}

export function writeSessionUser(jar: CookieWriter, user: Record<string, unknown>) {
  jar.set(USER_COOKIE, JSON.stringify(user), cookieOptions(REFRESH_MAX_AGE_SEC))
}

/** Expire every session cookie. `jar.delete` alone can leave them readable by the proxy. */
export function clearSession(jar: CookieWriter) {
  const expired = cookieOptions(0)
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, USER_COOKIE]) jar.set(name, "", expired)
}

export function readTokens(jar: CookieReader) {
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
  }
}

export async function getSessionTokens() {
  return readTokens(await cookies())
}

export async function getSessionUser(): Promise<User | null> {
  const raw = (await cookies()).get(USER_COOKIE)?.value
  if (!raw) return null
  try {
    return mapUser(JSON.parse(raw) as Record<string, unknown>)
  } catch {
    return null
  }
}
