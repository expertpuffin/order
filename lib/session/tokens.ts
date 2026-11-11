/** Refresh this many seconds before the JWT expires, so slow pages don't race it. */
const REFRESH_SKEW_SEC = 60

/** Decode the JWT payload without verifying — only used to read `exp`. */
function readJwtExp(token: string): number | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")
    const json = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("utf8")
    const payload = JSON.parse(json) as { exp?: number }
    return typeof payload.exp === "number" ? payload.exp : null
  } catch {
    return null
  }
}

export function isAccessTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true
  const exp = readJwtExp(token)
  if (exp == null) return true
  return exp * 1000 <= Date.now() + REFRESH_SKEW_SEC * 1000
}
