import { getApiBaseUrl } from "@/lib/api/config"

/** CMS bazen göreli /uploads yolu verir — API host'una bağla */
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
  const base = getApiBaseUrl()
  if (trimmed.startsWith("/")) return `${base}${trimmed}`
  return `${base}/${trimmed}`
}
