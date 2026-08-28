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

const PUBLIC_PATHS = [
  "/",
  "/catalog",
  "/login",
  "/register",
  "/verify-email",
  "/onboarding",
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)
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

  let access = request.cookies.get(ACCESS_COOKIE)?.value ?? null
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value ?? null

  // Why: cookie may still exist while JWT is expired; also refresh before skew window
  const needsRefresh = Boolean(refresh) && isAccessTokenExpired(access)

  if (needsRefresh && refresh) {
    const session = await callRefreshApi(refresh)
    if (session) {
      access = session.accessToken
      const response =
        pathname === "/login" || pathname === "/register"
          ? NextResponse.redirect(new URL("/", request.url))
          : NextResponse.next()
      applySessionToResponseCookies(response, session)
      return withSecurityHeaders(response)
    }
    // Refresh failed — clear stale cookies and fall through to login redirect
    if (!isPublic(pathname) && pathname !== "/") {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 })
      response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 })
      return withSecurityHeaders(response)
    }
  }

  if (!access && !isPublic(pathname) && pathname !== "/") {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return withSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  if (
    access &&
    !isAccessTokenExpired(access) &&
    (pathname === "/login" || pathname === "/register")
  ) {
    return withSecurityHeaders(
      NextResponse.redirect(new URL("/", request.url))
    )
  }

  // Expose pathname to RSC (dashboard layout refresh redirect)
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
