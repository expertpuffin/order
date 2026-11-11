/**
 * Category pictures: the API's image, else a slug match, else a distinct fallback.
 * Fallback images come from restoloop-mobile-app/data/mainCategories.ts — keep in step.
 */

const FALLBACK_IMAGES: Record<string, string> = {
  frozen: "https://images.unsplash.com/photo-1631455785127-25c4f2f46393?w=200&h=200&fit=crop",
  "chilled-dairy": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop",
  "chilled-dairy-products": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop",
  "fresh-produce": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
  "fruit-vegetables": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
  "meat-poultry": "https://images.unsplash.com/photo-1607623814075-e51df1a37d78?w=200&h=200&fit=crop",
  "meat-chicken-delicatessen": "https://images.unsplash.com/photo-1607623814075-e51df1a37d78?w=200&h=200&fit=crop",
  "dry-goods": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop",
  "oils-sauces-spices": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop&q=80",
  beverages: "https://images.unsplash.com/photo-1625772452528-048180e09fff?w=200&h=200&fit=crop",
  "water-beverages": "https://images.unsplash.com/photo-1625772452528-048180e09fff?w=200&h=200&fit=crop",
  "bar-cocktail": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&h=200&fit=crop",
  packaging: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=200&h=200&fit=crop",
  "cleaning-hygiene": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200&h=200&fit=crop",
  grill: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=200&h=200&fit=crop",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  confectionery: "https://images.unsplash.com/photo-1481391319762-47dff72954a8?w=200&h=200&fit=crop",
}

const FALLBACK_LIST = Object.values(FALLBACK_IMAGES)

function hashSlug(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  return hash
}

function imageForSlug(slug: string): string | undefined {
  if (FALLBACK_IMAGES[slug]) return FALLBACK_IMAGES[slug]
  const key = Object.keys(FALLBACK_IMAGES).find((k) => slug.includes(k) || k.includes(slug))
  return key ? FALLBACK_IMAGES[key] : undefined
}

/** `imageUrl` is the category's own (already resolved by the categories mapper). */
export function categoryImage(input: {
  slug: string | null
  imageUrl: string | null
  /** Position in the list, so categories without a slug match still get different pictures */
  index: number
}): string {
  if (input.imageUrl) return input.imageUrl
  const slug = (input.slug || "").toLowerCase().trim()
  if (!slug) return FALLBACK_LIST[input.index % FALLBACK_LIST.length]
  return imageForSlug(slug) ?? FALLBACK_LIST[hashSlug(slug) % FALLBACK_LIST.length]
}
