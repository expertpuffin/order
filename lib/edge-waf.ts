import { NextResponse, type NextRequest } from "next/server"

/**
 * Edge WAF (AWS yok) — probe path / traversal kesici.
 * Cloudflare edge WAF ile birlikte kullan; bu uygulama katmanı.
 */

const BLOCKED_PATH_RE =
  /(\.env|\.git|wp-admin|wp-login|phpmyadmin|adminer|xmlrpc\.php|\.php$|\/\.aws\/)/i

const TRAVERSAL_RE = /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i

export function edgeWaf(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl
  const target = `${pathname}${search}`

  if (TRAVERSAL_RE.test(target) || BLOCKED_PATH_RE.test(pathname)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  return null
}

export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "no-referrer")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )
  return response
}
