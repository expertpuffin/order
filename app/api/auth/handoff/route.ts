import { cookies } from "next/headers"
import { getApiBaseUrl } from "@/lib/api/config"
import { localRedirect } from "@/lib/local-redirect"
import {
  applySessionToResponseCookies,
  BUSINESS_COOKIE,
  cookieOptions,
  REFRESH_MAX_AGE_SEC,
} from "@/lib/auth/session"
import { safeNextPath } from "@/lib/safe-redirect"

export const runtime = "nodejs"

/**
 * Browser binding set by the business panel's /api/auth/order-panel just before
 * it sends the browser here. The API only redeems a code together with the state
 * it was minted for, so a code someone else made (and sent as a link) cannot
 * sign this browser into their account. Keep in sync with the business panel.
 */
const HANDOFF_STATE_COOKIE = "rl_handoff_state"
const HANDOFF_STATE_PATH = "/api/auth/handoff"

/**
 * GET /api/auth/handoff?code=…&next=/products&business=<id>
 * Arrival from the business panel (its /api/auth/order-panel): swap the one-time
 * code for a session, set the same cookies a login sets, then go to `next`.
 * A used, expired, missing or foreign code just lands on `next` — the panel asks to log in there.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  // Relative path on this panel only — never an open redirect.
  const next = safeNextPath(url.searchParams.get("next"), "/")
  const code = url.searchParams.get("code") ?? ""
  const business = url.searchParams.get("business") ?? ""
  const state = (await cookies()).get(HANDOFF_STATE_COOKIE)?.value ?? ""
  // Relative Location: request.url here is the pod's bind address (0.0.0.0:3000)
  const done = localRedirect(next)
  done.headers.set("Cache-Control", "no-store")
  done.headers.set("Referrer-Policy", "no-referrer")
  // One attempt per state, whatever the outcome
  done.cookies.set(HANDOFF_STATE_COOKIE, "", { ...cookieOptions(0), path: HANDOFF_STATE_PATH })
  if (!/^[a-f0-9]{64}$/.test(code) || !/^[a-f0-9]{64}$/.test(state)) return done

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/auth/handoff/consume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
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
