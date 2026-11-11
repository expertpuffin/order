import { refreshSession, logoutSession } from "@/lib/api/auth"
import { authGateHref } from "@/lib/auth-gate-url"
import { safeNextPath } from "@/lib/safe-redirect"
import { localRedirect } from "@/lib/local-redirect"

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
    return localRedirect(authGateHref({ tab: "login", next: safeNext }))
  }

  return localRedirect(safeNext)
}
