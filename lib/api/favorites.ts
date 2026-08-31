import { apiFetch } from "@/lib/api/client"
import { resolveMediaUrl } from "@/lib/api/media-url"

export type FavoriteItem = {
  itemId: string
  productId: string
  itemCode: string | null
  name: string
  brand: string | null
  imageUrl: string | null
  packSize: string | null
  quantity: number
  unit: string
  packagingOptions: string[]
  categorySlug: string | null
  categoryName: string | null
}

function asId(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

type RawFavoriteList = {
  lists?: Record<string, unknown>[]
}

function categoryFromProduct(product: Record<string, unknown>): {
  slug: string | null
  name: string | null
} {
  const categories = Array.isArray(product.categories)
    ? (product.categories as Record<string, unknown>[])
    : []
  const primary =
    categories.find((c) => Boolean(c.isPrimary)) ?? categories[0] ?? null
  const mainCategory = product.mainCategory as Record<string, unknown> | null
  const categoryPath = Array.isArray(product.categoryPath)
    ? (product.categoryPath as Record<string, unknown>[])
    : []
  const pathHead = categoryPath[0] ?? null

  const slug =
    (primary?.slug as string | undefined) ||
    (mainCategory?.slug as string | undefined) ||
    (pathHead?.slug as string | undefined) ||
    null
  const name =
    (primary?.name as string | undefined) ||
    (mainCategory?.name as string | undefined) ||
    (pathHead?.name as string | undefined) ||
    null

  return { slug: slug?.trim() || null, name: name?.trim() || null }
}

function mapItems(list: Record<string, unknown>): FavoriteItem[] {
  const items = Array.isArray(list.items)
    ? (list.items as Record<string, unknown>[])
    : []
  return items.map((raw) => {
    const product = (raw.product ?? {}) as Record<string, unknown>
    const packagings = Array.isArray(product.packagings)
      ? (product.packagings as Record<string, unknown>[])
      : []
    const category = categoryFromProduct(product)
    return {
      itemId: asId(raw._id),
      productId: asId(product._id),
      itemCode: product.itemCode ? String(product.itemCode) : null,
      name: String(product.name ?? ""),
      brand: (product.brand as string | null) ?? null,
      imageUrl: resolveMediaUrl((product.imageUrl as string | null) ?? null),
      packSize:
        (product.packSize as string | null) ??
        (product.sizeLabel as string | null) ??
        null,
      quantity: Number(raw.quantity ?? 1),
      unit: String(raw.unit ?? "EACH").toUpperCase(),
      packagingOptions: packagings.length
        ? packagings.map((p) => String(p.type ?? "EACH").toUpperCase())
        : ["EACH"],
      categorySlug: category.slug,
      categoryName: category.name,
    }
  })
}

/** Tek listeli model — "My Favourites". Liste yoksa oluşturur. */
export async function getFavorites(
  businessId: string
): Promise<{ listId: string | null; items: FavoriteItem[] }> {
  let data = await apiFetch<RawFavoriteList>(
    `/api/businesses/${businessId}/favorites`
  )

  if (!data.lists?.length) {
    await apiFetch(`/api/businesses/${businessId}/favorite-lists`, {
      method: "POST",
      body: {},
    })
    data = await apiFetch<RawFavoriteList>(
      `/api/businesses/${businessId}/favorites`
    )
  }

  const first = data.lists?.[0]
  return {
    listId: first ? asId(first._id) : null,
    items: first ? mapItems(first) : [],
  }
}

export async function addFavoriteItem(
  businessId: string,
  listId: string,
  productId: string
) {
  return apiFetch(`/api/businesses/${businessId}/favorite-lists/${listId}/items`, {
    method: "POST",
    body: { productId },
  })
}

export async function updateFavoriteItem(
  businessId: string,
  listId: string,
  itemId: string,
  input: { quantity?: number; unit?: string }
) {
  return apiFetch(
    `/api/businesses/${businessId}/favorite-lists/${listId}/items/${itemId}`,
    { method: "PATCH", body: input }
  )
}

export async function removeFavoriteItem(
  businessId: string,
  listId: string,
  itemId: string
) {
  return apiFetch(
    `/api/businesses/${businessId}/favorite-lists/${listId}/items/${itemId}`,
    { method: "DELETE" }
  )
}
