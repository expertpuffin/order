import { apiFetch } from "@/lib/api/client"
import { resolveMediaUrl } from "@/lib/api/media-url"
import { ApiError } from "@/lib/backend/errors"
import { asId, asNumber, preferredOffer, unitCode } from "@/lib/domain"
import type { Pagination } from "@/lib/pagination"
import { PRODUCT_PAGE_SIZE } from "@/lib/storefront-paths"


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
  /** For display: the price of the preferred (lowest priority) offer */
  unitPrice: number | null
  /** The list price, when on offer */
  compareAtPrice: number | null
  onOffer: boolean
  discountPercent: number | null
  currency: string
  /** Unit → ProductOffer id, sent when adding to the cart */
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

/** Full product detail — GET /api/products/by-code/:itemCode */
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
    ? raw.packagingOptions.map(unitCode)
    : ["EACH"]

  const listCost = Number(
    preferred?.listCost ?? preferred?.cost ?? preferredBase?.listCost ?? preferredBase?.cost ?? NaN
  )
  const effectiveCost = Number(
    preferred?.effectiveCost ??
      preferred?.cost ??
      preferredBase?.effectiveCost ??
      preferredBase?.cost ??
      NaN
  )
  const offerDelivery = Number(preferred?.offerDeliveryCost ?? NaN)
  const offerCollection = Number(preferred?.offerCollectionCost ?? NaN)
  const hasDeal =
    preferred?.activeDeal != null ||
    (Number.isFinite(listCost) &&
      Number.isFinite(effectiveCost) &&
      effectiveCost < listCost)
  const onOffer = Boolean(preferred?.onOffer) || hasDeal
  const offerPrice = Number.isFinite(effectiveCost)
    ? effectiveCost
    : Number.isFinite(offerDelivery)
      ? offerDelivery
      : Number.isFinite(offerCollection)
        ? offerCollection
        : NaN

  const unitPrice = Number.isFinite(offerPrice)
    ? offerPrice
    : Number.isFinite(listCost)
      ? listCost
      : null

  const compareAtPrice =
    Number.isFinite(listCost) &&
    unitPrice != null &&
    listCost > unitPrice
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
    if (id) offerIdsByUnit[unitCode(type)] = id
  }
  if (!Object.keys(offerIdsByUnit).length) {
    for (const pack of packagings) {
      const type = unitCode(pack.type)
      const hit = preferredOffer(Array.isArray(pack.suppliers) ? (pack.suppliers as Record<string, unknown>[]) : [])
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
    imageUrl: resolveMediaUrl((raw.imageUrl as string | null) ?? null),
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

function mapNutrition(raw: unknown): CatalogNutrition | null {
  if (!raw || typeof raw !== "object") return null
  const n = raw as Record<string, unknown>
  const unitsRaw = (n.units ?? {}) as Record<string, unknown>
  const extrasRaw = Array.isArray(n.extras) ? n.extras : []
  return {
    basis: n.basis === "perServing" ? "perServing" : "per100g",
    basisUnit: n.basisUnit === "ml" ? "ml" : "g",
    notOnPack: Boolean(n.notOnPack),
    energyKcal: asNumber(n.energyKcal),
    fat: asNumber(n.fat),
    protein: asNumber(n.protein),
    carbohydrate: asNumber(n.carbohydrate),
    sugars: asNumber(n.sugars),
    fibre: asNumber(n.fibre),
    salt: asNumber(n.salt),
    saturates: asNumber(n.saturates),
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
          value: asNumber(r.value),
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
        type: unitCode(pack.type),
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
  pagination: Pagination
}> {
  const data = await apiFetch<{
    products: Record<string, unknown>[]
    pagination: Pagination
  }>("/api/products", {
    auth: false,
    searchParams: { limit: PRODUCT_PAGE_SIZE, ...params },
  })
  return {
    products: (data.products ?? []).map(mapCatalogProduct),
    pagination: data.pagination,
  }
}

export async function getProductByItemCode(
  /** As it appears in the product URL, already decoded */
  itemCode: string
): Promise<CatalogProductDetail | null> {
  const code = itemCode.trim().toUpperCase()
  if (!code) return null
  try {
    const data = await apiFetch<{ product: Record<string, unknown> }>(
      `/api/products/by-code/${encodeURIComponent(code)}`,
      { auth: false }
    )
    return data.product ? mapCatalogProductDetail(data.product) : null
  } catch (error) {
    // Unknown code → the product page 404s; an API outage shows the error page instead
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null
    throw error
  }
}

/** Products on offer. The public list can't filter by it, so this scans a few pages. */
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
