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

export type CatalogProductImage = {
  url: string
  alt: string | null
}

export type CatalogProductPackaging = {
  type: string
  barcode: string | null
}

export type CatalogAllergenChip = {
  label: string
}

export type CatalogNutrition = {
  basis: "per100g" | "perServing"
  basisUnit: "g" | "ml"
  notOnPack: boolean
  energyKcal: number | null
  fat: number | null
  protein: number | null
  carbohydrate: number | null
  sugars: number | null
  fibre: number | null
  salt: number | null
  saturates: number | null
  units: {
    fat: string
    protein: string
    carbohydrate: string
    sugars: string
    fibre: string
    salt: string
    saturates: string
  }
  extras: Array<{ label: string; value: number | null; unit: string }>
}

/** Tam ürün detayı — GET /api/products/by-code/:itemCode */
export type CatalogProductDetail = CatalogProduct & {
  longDescription: string | null
  ingredients: string | null
  ingredientsNotApplicable: boolean
  allergens: string | null
  allergenChips: CatalogAllergenChip[]
  allergensNone: boolean
  allergensNotApplicable: boolean
  nutrition: CatalogNutrition | null
  nutritionNote: string | null
  storage: string | null
  barcode: string | null
  packagingCodes: Record<string, string | null>
  packagings: CatalogProductPackaging[]
  images: CatalogProductImage[]
  categoryName: string | null
  unitOfMeasure: string | null
  usageTags: string[]
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

function numOrNull(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function mapNutrition(raw: unknown): CatalogNutrition | null {
  if (!raw || typeof raw !== "object") return null
  const n = raw as Record<string, unknown>
  const unitsRaw = (n.units ?? {}) as Record<string, unknown>
  const extrasRaw = Array.isArray(n.extras) ? n.extras : []
  return {
    basis: n.basis === "perServing" ? "perServing" : "per100g",
    basisUnit: n.basisUnit === "ml" ? "ml" : "g",
    notOnPack: Boolean(n.notOnPack),
    energyKcal: numOrNull(n.energyKcal),
    fat: numOrNull(n.fat),
    protein: numOrNull(n.protein),
    carbohydrate: numOrNull(n.carbohydrate),
    sugars: numOrNull(n.sugars),
    fibre: numOrNull(n.fibre),
    salt: numOrNull(n.salt),
    saturates: numOrNull(n.saturates),
    units: {
      fat: String(unitsRaw.fat ?? "g"),
      protein: String(unitsRaw.protein ?? "g"),
      carbohydrate: String(unitsRaw.carbohydrate ?? "g"),
      sugars: String(unitsRaw.sugars ?? "g"),
      fibre: String(unitsRaw.fibre ?? "g"),
      salt: String(unitsRaw.salt ?? "g"),
      saturates: String(unitsRaw.saturates ?? "g"),
    },
    extras: extrasRaw
      .filter((row) => row && typeof row === "object")
      .map((row) => {
        const r = row as Record<string, unknown>
        return {
          label: String(r.label ?? ""),
          value: numOrNull(r.value),
          unit: String(r.unit ?? "g"),
        }
      })
      .filter((row) => row.label),
  }
}

function mapCatalogProductDetail(
  raw: Record<string, unknown>
): CatalogProductDetail {
  const base = mapCatalogProduct(raw)
  const packagings = Array.isArray(raw.packagings)
    ? (raw.packagings as Record<string, unknown>[]).map((pack) => ({
        type: String(pack.type ?? "EACH").toUpperCase(),
        barcode: (pack.barcode as string | null) ?? null,
      }))
    : []
  const packagingCodesRaw = (raw.packagingCodes ?? {}) as Record<
    string,
    unknown
  >
  const packagingCodes: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(packagingCodesRaw)) {
    packagingCodes[key.toUpperCase()] =
      value != null && value !== "" ? String(value) : null
  }
  const images = (Array.isArray(raw.images) ? raw.images : [])
    .map((img) => {
      const row = img as Record<string, unknown>
      const url = resolveMediaUrl((row.url as string | null) ?? null)
      if (!url) return null
      return {
        url,
        alt: (row.alt as string | null) ?? null,
      }
    })
    .filter(Boolean) as CatalogProductImage[]
  const mainCategory = raw.mainCategory as Record<string, unknown> | null
  const categoryPath = Array.isArray(raw.categoryPath)
    ? (raw.categoryPath as Record<string, unknown>[])
    : []
  const categoryName =
    (mainCategory?.name as string | undefined) ||
    (categoryPath[0]?.name as string | undefined) ||
    null

  return {
    ...base,
    imageUrl: resolveMediaUrl(base.imageUrl),
    longDescription: (raw.longDescription as string | null) ?? null,
    ingredients: (raw.ingredients as string | null) ?? null,
    ingredientsNotApplicable: Boolean(raw.ingredientsNotApplicable),
    allergens: (raw.allergens as string | null) ?? null,
    allergenChips: Array.isArray(raw.allergenChips)
      ? raw.allergenChips
          .map((chip) => {
            const c = chip as Record<string, unknown>
            const label = String(c.label ?? "").trim()
            return label ? { label } : null
          })
          .filter(Boolean) as CatalogAllergenChip[]
      : [],
    allergensNone: Boolean(raw.allergensNone),
    allergensNotApplicable: Boolean(raw.allergensNotApplicable),
    nutrition: mapNutrition(raw.nutrition),
    nutritionNote: (raw.nutritionNote as string | null) ?? null,
    storage: (raw.storage as string | null) ?? null,
    barcode: (raw.barcode as string | null) ?? null,
    packagingCodes,
    packagings,
    images,
    categoryName,
    unitOfMeasure: (raw.unitOfMeasure as string | null) ?? null,
    usageTags: Array.isArray(raw.usageTags)
      ? raw.usageTags.map((tag) => String(tag)).filter(Boolean)
      : [],
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

export async function getProductByItemCode(
  itemCode: string
): Promise<CatalogProductDetail | null> {
  try {
    const code = decodeURIComponent(itemCode).trim().toUpperCase()
    if (!code) return null
    const data = await apiFetch<{ product: Record<string, unknown> }>(
      `/api/products/by-code/${encodeURIComponent(code)}`,
      { auth: false }
    )
    if (!data.product) return null
    return mapCatalogProductDetail(data.product)
  } catch {
    return null
  }
}

/** @deprecated Prefer getProductByItemCode for storefront URLs */
export async function getProduct(id: string): Promise<CatalogProductDetail | null> {
  try {
    const data = await apiFetch<{ product: Record<string, unknown> }>(
      `/api/products/${encodeURIComponent(id)}`,
      { auth: false }
    )
    if (!data.product) return null
    return mapCatalogProductDetail(data.product)
  } catch {
    return null
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
