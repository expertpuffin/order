import { publicApiUrl } from "@/lib/backend/config"

/** The CMS sometimes returns a relative /uploads path; the browser loads it from the public API host. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = String(url).trim()
  if (!trimmed) return null
  if (
    trimmed.includes("ordoria.example") ||
    trimmed.includes("example.com")
  ) {
    return null
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`
  }
  const base = publicApiUrl()
  if (trimmed.startsWith("/")) return `${base}${trimmed}`
  return `${base}/${trimmed}`
}
