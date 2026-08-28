import { apiFetch } from "@/lib/api/client"
import { resolveMediaUrl } from "@/lib/api/media-url"

export { resolveMediaUrl } from "@/lib/api/media-url"

export type LocalizedString = {
  en?: string
  tr?: string
}

export type MarketBanner = {
  id: string
  title: string
  body: string
  imageUrl: string | null
  ctaLabel: string
  href: string | null
  background: string | null
  textColor: string | null
}

function pickLocalized(
  value: LocalizedString | string | null | undefined,
  locale: string
): string {
  if (!value) return ""
  if (typeof value === "string") return value
  const preferred = locale.startsWith("tr") ? value.tr : value.en
  return preferred || value.en || value.tr || ""
}

function resolveCtaHref(cta?: {
  kind?: string
  value?: string
} | null): string | null {
  if (!cta?.value) return null
  const kind = cta.kind || "none"
  if (kind === "none") return null
  if (kind === "url") return cta.value
  if (kind === "route" || kind === "deep_link") {
    if (cta.value.startsWith("/")) return cta.value
    if (cta.value.startsWith("category:")) {
      return `/?category=${encodeURIComponent(cta.value.slice("category:".length))}`
    }
    return cta.value.startsWith("http")
      ? cta.value
      : `/${cta.value.replace(/^\//, "")}`
  }
  return null
}

export async function listHomeBanners(locale: string): Promise<MarketBanner[]> {
  try {
    const data = await apiFetch<{
      contents?: Record<string, unknown>[]
    } | Record<string, unknown>[]>("/api/app/contents", {
      auth: false,
      searchParams: {
        placement: "home_carousel",
        locale: locale.startsWith("tr") ? "tr" : "en",
      },
    })

    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data.contents)
        ? data.contents
        : []

    return rows.map((raw) => {
      const row = raw as Record<string, unknown>
      const theme = (row.theme ?? {}) as Record<string, unknown>
      const cta = (row.cta ?? null) as { kind?: string; value?: string } | null
      return {
        id: String(row._id ?? row.id ?? Math.random()),
        title: pickLocalized(row.title as LocalizedString, locale),
        body: pickLocalized(row.body as LocalizedString, locale),
        imageUrl: resolveMediaUrl(
          (row.imageUrl as string | null | undefined) ?? null
        ),
        ctaLabel: pickLocalized(row.ctaLabel as LocalizedString, locale),
        href: resolveCtaHref(cta),
        background: (theme.background as string | null) ?? null,
        textColor: (theme.text as string | null) ?? null,
      }
    })
  } catch {
    return []
  }
}
