import { NextResponse } from "next/server"

import { refreshSession, logoutSession } from "@/lib/api/auth"
import { authGateHref } from "@/lib/auth-gate-url"
import { safeNextPath } from "@/lib/safe-redirect"

/**
 * Cookie-writable refresh endpoint — used when RSC cannot call cookies().set.
 * GET /api/auth/refresh-session?next=/items
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const safeNext = safeNextPath(url.searchParams.get("next"), "/")

  const access = await refreshSession()
  if (!access) {
    await logoutSession().catch(() => {})
    return NextResponse.redirect(
      new URL(authGateHref({ tab: "login", next: safeNext }), url.origin)
    )
  }

  return NextResponse.redirect(new URL(safeNext, url.origin))
}
