/**
 * Kategori görselleri — API imageUrl, slug eşleşmesi, yoksa benzersiz fallback.
 * Kaynak görseller: restoloop-mobile-app/data/mainCategories.ts
 */
import { resolveMediaUrl } from "@/lib/api/media-url"

export const CATEGORY_VISUAL_FALLBACKS: Record<
  string,
  { imageUri: string; cardBg: string }
> = {
  frozen: {
    cardBg: "#2563EB",
    imageUri:
      "https://images.unsplash.com/photo-1631455785127-25c4f2f46393?w=200&h=200&fit=crop",
  },
  "chilled-dairy": {
    cardBg: "#7DD3FC",
    imageUri:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop",
  },
  "chilled-dairy-products": {
    cardBg: "#7DD3FC",
    imageUri:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop",
  },
  "fresh-produce": {
    cardBg: "#4ADE80",
    imageUri:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
  },
  "fruit-vegetables": {
    cardBg: "#4ADE80",
    imageUri:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
  },
  "meat-poultry": {
    cardBg: "#FCA5A5",
    imageUri:
      "https://images.unsplash.com/photo-1607623814075-e51df1a37d78?w=200&h=200&fit=crop",
  },
  "meat-chicken-delicatessen": {
    cardBg: "#FCA5A5",
    imageUri:
      "https://images.unsplash.com/photo-1607623814075-e51df1a37d78?w=200&h=200&fit=crop",
  },
  "dry-goods": {
    cardBg: "#D4A574",
    imageUri:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
  },
  "oils-sauces-spices": {
    cardBg: "#FDBA74",
    imageUri:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop&q=80",
  },
  beverages: {
    cardBg: "#93C5FD",
    imageUri:
      "https://images.unsplash.com/photo-1625772452528-048180e09fff?w=200&h=200&fit=crop",
  },
  "water-beverages": {
    cardBg: "#93C5FD",
    imageUri:
      "https://images.unsplash.com/photo-1625772452528-048180e09fff?w=200&h=200&fit=crop",
  },
  "bar-cocktail": {
    cardBg: "#F9A8D4",
    imageUri:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&h=200&fit=crop",
  },
  packaging: {
    cardBg: "#2DD4BF",
    imageUri:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=200&h=200&fit=crop",
  },
  "cleaning-hygiene": {
    cardBg: "#C4B5FD",
    imageUri:
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200&h=200&fit=crop",
  },
  grill: {
    cardBg: "#FBBF24",
    imageUri:
      "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop",
  },
  bakery: {
    cardBg: "#FCD34D",
    imageUri:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  },
  confectionery: {
    cardBg: "#F472B6",
    imageUri:
      "https://images.unsplash.com/photo-1481391319762-47dff72954a8?w=200&h=200&fit=crop",
  },
}

const FALLBACK_IMAGE_LIST = Object.values(CATEGORY_VISUAL_FALLBACKS).map(
  (v) => v.imageUri
)

const FALLBACK_PALETTE = Object.values(CATEGORY_VISUAL_FALLBACKS).map(
  (v) => v.cardBg
)

function hashSlug(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  }
  return hash
}

function colorForSlug(slug: string): string {
  return FALLBACK_PALETTE[hashSlug(slug) % FALLBACK_PALETTE.length]
}

function findVisualHint(slug: string) {
  if (!slug) return undefined
  if (CATEGORY_VISUAL_FALLBACKS[slug]) return CATEGORY_VISUAL_FALLBACKS[slug]

  const keys = Object.keys(CATEGORY_VISUAL_FALLBACKS)
  const partial = keys.find(
    (key) => slug.includes(key) || key.includes(slug)
  )
  return partial ? CATEGORY_VISUAL_FALLBACKS[partial] : undefined
}

function fallbackImageFor(slug: string, index: number): string {
  if (slug) {
    const hint = findVisualHint(slug)
    if (hint) return hint.imageUri
    return FALLBACK_IMAGE_LIST[hashSlug(slug) % FALLBACK_IMAGE_LIST.length]
  }
  return FALLBACK_IMAGE_LIST[index % FALLBACK_IMAGE_LIST.length]
}

export function resolveCategoryVisual(input: {
  slug: string | null
  name?: string
  imageUrl: string | null
  color: string | null
  /** Liste sırası — slug eşleşmezse her kategoriye farklı görsel */
  index?: number
}): { imageUri: string; cardBg: string } {
  const slug = (input.slug || "").toLowerCase().trim()
  const index = input.index ?? 0
  const hint = findVisualHint(slug)
  const apiImage = resolveMediaUrl(input.imageUrl)

  if (apiImage) {
    return {
      imageUri: apiImage,
      cardBg: input.color || hint?.cardBg || colorForSlug(slug || String(index)),
    }
  }

  if (hint) {
    return {
      imageUri: hint.imageUri,
      cardBg: input.color || hint.cardBg,
    }
  }

  return {
    imageUri: fallbackImageFor(slug, index),
    cardBg: input.color || colorForSlug(slug || String(index)),
  }
}
