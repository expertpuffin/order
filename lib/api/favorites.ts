import { apiFetch } from "@/lib/api/client"

export type FavoriteItem = {
  itemId: string
  productId: string
  name: string
  brand: string | null
  imageUrl: string | null
  packSize: string | null
  quantity: number
  unit: string
  packagingOptions: string[]
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

function mapItems(list: Record<string, unknown>): FavoriteItem[] {
  const items = Array.isArray(list.items)
    ? (list.items as Record<string, unknown>[])
    : []
  return items.map((raw) => {
    const product = (raw.product ?? {}) as Record<string, unknown>
    const packagings = Array.isArray(product.packagings)
      ? (product.packagings as Record<string, unknown>[])
      : []
    return {
      itemId: asId(raw._id),
      productId: asId(product._id),
      name: String(product.name ?? ""),
      brand: (product.brand as string | null) ?? null,
      imageUrl: (product.imageUrl as string | null) ?? null,
      packSize: (product.packSize as string | null) ?? null,
      quantity: Number(raw.quantity ?? 1),
      unit: String(raw.unit ?? "EACH"),
      packagingOptions: packagings.length
        ? packagings.map((p) => String(p.type ?? "EACH").toUpperCase())
        : ["EACH"],
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
