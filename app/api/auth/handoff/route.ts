import { getApiBaseUrl } from "@/lib/api/config"
import { localRedirect } from "@/lib/local-redirect"
import {
  applySessionToResponseCookies,
  BUSINESS_COOKIE,
  cookieOptions,
  REFRESH_MAX_AGE_SEC,
} from "@/lib/auth/session"

export const runtime = "nodejs"

/** Relative path on this panel only — never an open redirect or header injection. */
const safeNext = (v: string | null) =>
  v && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") && !/[\u0000-\u001f\u007f]/.test(v)
    ? v
    : "/"

/**
 * GET /api/auth/handoff?code=…&next=/products&business=<id>
 * Arrival from the business panel (its /api/auth/order-panel): swap the one-time
 * code for a session, set the same cookies a login sets, then go to `next`.
 * A used, expired or missing code just lands on `next` — the panel asks to log in there.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeNext(url.searchParams.get("next"))
  const code = url.searchParams.get("code") ?? ""
  const business = url.searchParams.get("business") ?? ""
  // Relative Location: request.url here is the pod's bind address (0.0.0.0:3000)
  const done = localRedirect(next)
  done.headers.set("Cache-Control", "no-store")
  done.headers.set("Referrer-Policy", "no-referrer")
  if (!/^[a-f0-9]{64}$/.test(code)) return done

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/handoff/consume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
      cache: "no-store",
    })
    const json = (await res.json().catch(() => null)) as {
      data?: { accessToken?: string; refreshToken?: string; user?: Record<string, unknown> }
    } | null
    if (!res.ok || !json?.data?.accessToken || !json.data.user) return done
    applySessionToResponseCookies(done, {
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken?.trim() || null,
      user: json.data.user,
    })
    // Same business the user was working in on the business panel
    if (/^[a-f0-9]{24}$/i.test(business)) done.cookies.set(BUSINESS_COOKIE, business, cookieOptions(REFRESH_MAX_AGE_SEC))
  } catch {
    // Network trouble — fall through to the plain page
  }
  return done
}
