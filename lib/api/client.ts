import { cookies } from "next/headers"

import { apiUrl } from "@/lib/backend/config"
import { ApiError } from "@/lib/backend/errors"
import { refreshSession } from "@/lib/session/backend"
import { getSessionTokens, writeSession } from "@/lib/session/cookies"
import { isAccessTokenExpired } from "@/lib/session/tokens"

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  searchParams?: Record<string, string | number | boolean | undefined | null>
  cache?: RequestCache
  formData?: FormData
}

// Parallel requests of one user share a refresh, so the token isn't rotated twice.
// Keyed by that user's refresh token: the server process serves every user, and a
// refresh started for one must never hand its access token to another.
const refreshInFlight = new Map<string, Promise<string | null>>()

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const pending = refreshInFlight.get(refreshToken)
  if (pending) return pending

  const flight = (async () => {
    const session = await refreshSession(refreshToken)
    if (!session) return null
    try {
      writeSession(await cookies(), session)
    } catch {
      // Server components can't set cookies; the proxy refreshes before render
      // so this path only runs when a token expires mid-request.
    }
    return session.accessToken
  })().finally(() => refreshInFlight.delete(refreshToken))
  refreshInFlight.set(refreshToken, flight)
  return flight
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, searchParams, cache = "no-store", formData } = options

  const tokens = auth ? await getSessionTokens() : null
  let token = tokens?.accessToken ?? null
  if (tokens?.refreshToken && isAccessTokenExpired(token)) {
    token = (await refreshAccessToken(tokens.refreshToken)) ?? token
  }

  const url = new URL(`${apiUrl()}${path}`)
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value === undefined || value === null || value === "") continue
    url.searchParams.set(key, String(value))
  }

  const send = (accessToken: string | null) =>
    fetch(url, {
      method,
      headers: {
        ...(formData ? {} : { "Content-Type": "application/json" }),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      cache,
    })

  let res = await send(token)
  if (res.status === 401 && tokens?.refreshToken) {
    const refreshed = await refreshAccessToken(tokens.refreshToken)
    if (refreshed) res = await send(refreshed)
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean
    message?: string
    error?: string
    errors?: string[]
    code?: string
    details?: Record<string, unknown>
    data?: T
  } | null

  if (!res.ok || json?.success === false) {
    throw new ApiError(
      json?.message || json?.error || `Request failed (${res.status})`,
      res.status,
      json?.errors,
      json?.code,
      json?.details
    )
  }

  return (json?.data ?? json) as T
}
