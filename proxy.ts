import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  applySessionToResponseCookies,
} from "@/lib/auth/session"
import {
  callRefreshApi,
  isAccessTokenExpired,
} from "@/lib/auth/refresh"
import { edgeWaf, withSecurityHeaders } from "@/lib/edge-waf"
import { authGateHref } from "@/lib/auth-gate-url"

const PUBLIC_PATHS = [
  "/",
  "/catalog",
  "/verify-email",
  "/onboarding",
]

function isPublic(pathname: string) {
  if (pathname.startsWith("/products/")) return true
  return PUBLIC_PATHS.some(
    (p) =>
      p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
  )
}

export async function proxy(request: NextRequest) {
  const blocked = edgeWaf(request)
  if (blocked) return blocked

  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return withSecurityHeaders(NextResponse.next())
  }

  // Legacy standalone auth pages → home modal
  if (pathname === "/login" || pathname === "/register") {
    const tab = pathname === "/register" ? "register" : "login"
    const next = request.nextUrl.searchParams.get("next") || undefined
    return withSecurityHeaders(
      NextResponse.redirect(new URL(authGateHref({ tab, next }), request.url))
    )
  }

  let access = request.cookies.get(ACCESS_COOKIE)?.value ?? null
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value ?? null

  const needsRefresh = Boolean(refresh) && isAccessTokenExpired(access)

  if (needsRefresh && refresh) {
    const session = await callRefreshApi(refresh)
    if (session) {
      access = session.accessToken
      const response = NextResponse.next()
      applySessionToResponseCookies(response, session)
      return withSecurityHeaders(response)
    }
    if (!isPublic(pathname) && pathname !== "/") {
      const response = NextResponse.redirect(
        new URL(authGateHref({ tab: "login", next: pathname }), request.url)
      )
      response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 })
      response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 })
      return withSecurityHeaders(response)
    }
  }

  if (!access && !isPublic(pathname) && pathname !== "/") {
    return withSecurityHeaders(
      NextResponse.redirect(
        new URL(authGateHref({ tab: "login", next: pathname }), request.url)
      )
    )
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)
  return withSecurityHeaders(
    NextResponse.next({
      request: { headers: requestHeaders },
    })
  )
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
