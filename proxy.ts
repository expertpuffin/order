import { NextResponse, type NextRequest } from "next/server"

import { authGateHref } from "@/lib/auth-gate-url"
import { edgeWaf, withSecurityHeaders } from "@/lib/edge-waf"
import { refreshSession } from "@/lib/session/backend"
import { clearSession, readTokens, writeSession } from "@/lib/session/cookies"
import { isAccessTokenExpired } from "@/lib/session/tokens"
import { ONBOARDING_PATHS } from "@/lib/storefront-paths"

/** Browsable without a session; everything else needs one. */
function isPublic(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/products/") ||
    pathname === ONBOARDING_PATHS.start ||
    pathname.startsWith(`${ONBOARDING_PATHS.start}/`)
  )
}

function signInRedirect(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  return NextResponse.redirect(new URL(authGateHref({ tab: "login", next: `${pathname}${search}` }), request.url))
}

async function route(request: NextRequest): Promise<NextResponse> {
  const blocked = edgeWaf(request)
  if (blocked) return blocked

  const { pathname } = request.nextUrl

  // Assets and API routes (which handle their own auth). Paths with a dot are files.
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/") || pathname.includes(".")) {
    return withSecurityHeaders(NextResponse.next())
  }

  const { accessToken, refreshToken } = readTokens(request.cookies)

  // Refresh here, before render: server components can't write cookies.
  if (refreshToken && isAccessTokenExpired(accessToken)) {
    const session = await refreshSession(refreshToken)
    if (session) {
      // The page rendering this request reads the new tokens too
      writeSession({ set: (name, value) => request.cookies.set(name, value) }, session)
      const response = NextResponse.next({ request: { headers: new Headers(request.headers) } })
      writeSession(response.cookies, session)
      return withSecurityHeaders(response)
    }
    if (!isPublic(pathname)) {
      const response = signInRedirect(request)
      clearSession(response.cookies)
      return withSecurityHeaders(response)
    }
  }

  if (!accessToken && !isPublic(pathname)) {
    return withSecurityHeaders(signInRedirect(request))
  }

  return withSecurityHeaders(NextResponse.next())
}

/**
 * Server actions (form submits) must reach the action: a redirect here makes
 * the client throw "An unexpected response was received from the server" —
 * e.g. submitting the login form after a session appeared in another tab.
 * Let them through, keeping any cookies (a refreshed session) we set.
 */
export async function proxy(request: NextRequest) {
  const response = await route(request)
  if (!request.headers.has("next-action") || !response.headers.has("location")) {
    return response
  }
  const passThrough = NextResponse.next()
  for (const cookie of response.cookies.getAll()) {
    passThrough.cookies.set(cookie)
  }
  return withSecurityHeaders(passThrough)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
