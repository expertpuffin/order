const BASE = "http://panel.invalid"

/**
 * A post-login / post-refresh `next` value, reduced to a path on this panel.
 * Anything that would leave the origin falls back: "//evil.example",
 * "/\evil.example", embedded tabs or newlines (browsers drop them, turning
 * "/\t/evil" into "//evil"), absolute URLs.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback
  if (value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback
  try {
    const url = new URL(value, BASE)
    if (url.origin !== BASE) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
