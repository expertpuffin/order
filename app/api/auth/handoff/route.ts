import { cookies } from "next/headers"

import { setActiveBusiness } from "@/lib/business-context"
import { localRedirect } from "@/lib/local-redirect"
import { safeNextPath } from "@/lib/safe-redirect"
import { requestSession } from "@/lib/session/backend"
import { cookieOptions, writeSession } from "@/lib/session/cookies"

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
    writeSession(done.cookies, await requestSession("/api/auth/handoff/consume", { code, state }, "Handoff failed"))
    // Same business the user was working in on the business panel
    if (/^[a-f0-9]{24}$/i.test(business)) setActiveBusiness(done.cookies, business)
  } catch {
    // Rejected code or network trouble — land on the plain page
  }
  return done
}
