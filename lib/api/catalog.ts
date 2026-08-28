import { apiFetch } from "@/lib/api/client"
import { resolveMediaUrl } from "@/lib/api/media-url"

export type CatalogPagination = {
  page: number
  limit: number
  total: number
  pages: number
}

export type CatalogProduct = {
  id: string
  itemCode: string
  name: string
  brand: string | null
  description: string | null
  imageUrl: string | null
  packSize: string | null
  sizeLabel: string | null
  ageRestricted: boolean
  packagingOptions: string[]
  /** preferred (lowest priority) teklifin fiyatı — görüntüleme amaçlı */
  unitPrice: number | null
  /** onOffer ise eski / liste fiyatı */
  compareAtPrice: number | null
  onOffer: boolean
  discountPercent: number | null
  currency: string
  /** Birim → ProductOffer id (sepete eklerken) */
  offerIdsByUnit: Record<string, string>
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string | null
  depth: number
  parentId: string | null
  imageUrl: string | null
  icon: string | null
  color: string | null
}

function asId(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

function pickOfferSupplier(
  preferred: Record<string, unknown> | null,
  packagings: Record<string, unknown>[]
): Record<string, unknown> | null {
  if (preferred && preferred.onOffer) return preferred
  for (const pack of packagings) {
    const suppliers = Array.isArray(pack.suppliers)
      ? (pack.suppliers as Record<string, unknown>[])
      : []
    const hit = suppliers.find((s) => s.onOffer)
    if (hit) return hit
  }
  return preferred
}

function mapCatalogProduct(raw: Record<string, unknown>): CatalogProduct {
  const packagings = Array.isArray(raw.packagings)
    ? (raw.packagings as Record<string, unknown>[])
    : []
  const suppliers = Array.isArray(raw.suppliers)
    ? (raw.suppliers as Record<string, unknown>[])
    : []
  const preferredBase = suppliers[0] ?? null
  const preferred = pickOfferSupplier(preferredBase, packagings)

  const packagingOptions = Array.isArray(raw.packagingOptions)
    ? raw.packagingOptions.map((t) => String(t).toUpperCase())
    : ["EACH"]

  const listCost = Number(preferred?.cost ?? preferredBase?.cost ?? NaN)
  const offerDelivery = Number(preferred?.offerDeliveryCost ?? NaN)
  const offerCollection = Number(preferred?.offerCollectionCost ?? NaN)
  const onOffer = Boolean(preferred?.onOffer)
  const offerPrice = Number.isFinite(offerDelivery)
    ? offerDelivery
    : Number.isFinite(offerCollection)
      ? offerCollection
      : NaN

  const unitPrice = onOffer && Number.isFinite(offerPrice)
    ? offerPrice
    : Number.isFinite(listCost)
      ? listCost
      : null

  const compareAtPrice =
    onOffer && Number.isFinite(listCost) && unitPrice != null && listCost > unitPrice
      ? listCost
      : null

  const discountPercent =
    compareAtPrice != null && unitPrice != null && compareAtPrice > 0
      ? Math.round(((compareAtPrice - unitPrice) / compareAtPrice) * 100)
      : null

  const preferredByType = (raw.preferredByType ?? {}) as Record<
    string,
    Record<string, unknown>
  >
  const offerIdsByUnit: Record<string, string> = {}
  for (const [type, offer] of Object.entries(preferredByType)) {
    const id = asId(offer?._id)
    if (id) offerIdsByUnit[String(type).toUpperCase()] = id
  }
  if (!Object.keys(offerIdsByUnit).length) {
    for (const pack of packagings) {
      const type = String(pack.type ?? "").toUpperCase()
      const packSuppliers = Array.isArray(pack.suppliers)
        ? (pack.suppliers as Record<string, unknown>[])
        : []
      const hit = [...packSuppliers].sort(
        (a, b) => Number(a.priority ?? 999) - Number(b.priority ?? 999)
      )[0]
      const id = asId(hit?._id ?? hit?.offerId)
      if (type && id) offerIdsByUnit[type] = id
    }
  }

  return {
    id: asId(raw._id ?? raw.id),
    itemCode: String(raw.itemCode ?? ""),
    name: String(raw.name ?? ""),
    brand: (raw.brand as string | null) ?? null,
    description: (raw.description as string | null) ?? null,
    imageUrl: (raw.imageUrl as string | null) ?? null,
    packSize: (raw.packSize as string | null) ?? null,
    sizeLabel: (raw.sizeLabel as string | null) ?? null,
    ageRestricted: Boolean(raw.ageRestriction),
    packagingOptions,
    unitPrice,
    compareAtPrice,
    onOffer,
    discountPercent,
    currency: String(preferred?.currency ?? preferredBase?.currency ?? "GBP"),
    offerIdsByUnit,
  }
}

export async function listProducts(params?: {
  q?: string
  categorySlug?: string
  page?: number
  limit?: number
}): Promise<{
  products: CatalogProduct[]
  pagination: CatalogPagination
}> {
  const data = await apiFetch<{
    products: Record<string, unknown>[]
    pagination: CatalogPagination
  }>("/api/products", {
    auth: false,
    searchParams: { limit: 24, ...params },
  })
  return {
    products: (data.products ?? []).map(mapCatalogProduct),
    pagination: data.pagination,
  }
}

/** onOffer ürünleri — public listede filtre yok, sayfalardan tarar */
export async function listOfferProducts(limit = 12): Promise<CatalogProduct[]> {
  const collected: CatalogProduct[] = []
  for (let page = 1; page <= 3 && collected.length < limit; page += 1) {
    const { products, pagination } = await listProducts({ page, limit: 40 })
    for (const product of products) {
      if (product.onOffer) collected.push(product)
      if (collected.length >= limit) break
    }
    if (page >= pagination.pages) break
  }
  return collected.slice(0, limit)
}

export async function listCategories(): Promise<CatalogCategory[]> {
  const data = await apiFetch<{ categories: Record<string, unknown>[] }>(
    "/api/categories",
    { auth: false, searchParams: { tree: true, active: true } }
  )

  const flat: CatalogCategory[] = []
  const walk = (
    nodes: Record<string, unknown>[],
    depth: number,
    parentId: string | null
  ) => {
    for (const node of nodes ?? []) {
      const id = asId(node._id ?? node.id)
      flat.push({
        id,
        name: String(node.name ?? ""),
        slug: (node.slug as string | null) ?? null,
        depth,
        parentId,
        imageUrl: resolveMediaUrl((node.imageUrl as string | null) ?? null),
        icon: (node.icon as string | null) ?? null,
        color: (node.color as string | null) ?? null,
      })
      if (Array.isArray(node.children)) {
        walk(node.children as Record<string, unknown>[], depth + 1, id)
      }
    }
  }
  walk(data.categories ?? [], 0, null)
  return flat
}
