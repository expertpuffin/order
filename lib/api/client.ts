import {
  getAccessToken,
  getRefreshToken,
  persistSessionCookies,
} from "@/lib/auth/session"
import {
  callRefreshApi,
  isAccessTokenExpired,
} from "@/lib/auth/refresh"
import { getApiBaseUrl } from "@/lib/api/config"
import { ApiError } from "@/lib/api/errors"

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
  auth?: boolean
  searchParams?: Record<string, string | number | boolean | undefined | null>
  cache?: RequestCache
  formData?: FormData
}

/** Single-flight refresh so parallel RSC fetches don't rotate thrash. */
let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessForRequest(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) return null
    const session = await callRefreshApi(refreshToken)
    if (!session) return null
    try {
      await persistSessionCookies(session)
    } catch {
      /* RSC: cookie write deferred to proxy / refresh-session route */
    }
    return session.accessToken
  })().finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    searchParams,
    cache = "no-store",
    formData,
  } = options

  let token = options.token
  if (auth && token === undefined) {
    token = await getAccessToken()
    // Proactive refresh before the request if JWT is already dead/expiring
    if (isAccessTokenExpired(token)) {
      const next = await refreshAccessForRequest()
      if (next) token = next
    }
  }

  const url = new URL(
    path.startsWith("http") ? path : `${getApiBaseUrl()}${path}`
  )
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }

  const headers: Record<string, string> = {}
  if (!formData) {
    headers["Content-Type"] = "application/json"
  }
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res = await fetch(url, {
    method,
    headers,
    body: formData
      ? formData
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
    cache,
  })

  if (res.status === 401 && auth) {
    const next = await refreshAccessForRequest()
    if (next) {
      headers.Authorization = `Bearer ${next}`
      res = await fetch(url, {
        method,
        headers,
        body: formData
          ? formData
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
        cache,
      })
    }
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean
    message?: string
    error?: string
    errors?: string[]
    data?: T
  } | null

  if (!res.ok || json?.success === false) {
    throw new ApiError(
      json?.message || json?.error || `Request failed (${res.status})`,
      res.status,
      json?.errors
    )
  }

  return (json?.data ?? json) as T
}
