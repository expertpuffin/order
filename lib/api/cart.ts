import { apiFetch } from "@/lib/api/client"

export type CheckoutGroup = {
  supplierId: string
  supplierCode: string | null
  lineCount: number
  items: Array<{
    cartItemId: string
    productId: string
    name: string
    offerId: string
    quantity: number
    unit: string
  }>
}

export type CartLine = {
  id: string
  productId: string
  name: string
  brand: string | null
  imageUrl: string | null
  packSize: string | null
  quantity: number
  unit: string
  comment: string | null
  packagingOptions: string[]
  /** Görüntüleme amaçlı: ilgili packaging'ın preferred teklif fiyatı */
  unitPrice: number | null
  currency: string
}

function asId(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

export function mapCartLine(raw: Record<string, unknown>): CartLine {
  const product = (raw.product ?? {}) as Record<string, unknown>
  const unit = String(raw.unit ?? "EACH").toUpperCase()
  const packagings = Array.isArray(product.packagings)
    ? (product.packagings as Record<string, unknown>[])
    : []

  const packaging = packagings.find(
    (p) => String(p.type ?? "").toUpperCase() === unit
  )
  const suppliers = Array.isArray(packaging?.suppliers)
    ? (packaging?.suppliers as Record<string, unknown>[]).filter(
        (s) => (s.status ?? "active") === "active"
      )
    : []
  const preferred =
    [...suppliers].sort(
      (a, b) => Number(a.priority ?? 999) - Number(b.priority ?? 999)
    )[0] ?? null

  const cost = Number(preferred?.cost ?? NaN)

  return {
    id: asId(raw._id),
    productId: asId(product._id),
    name: String(product.name ?? ""),
    brand: (product.brand as string | null) ?? null,
    imageUrl: (product.imageUrl as string | null) ?? null,
    packSize: (product.packSize as string | null) ?? null,
    quantity: Number(raw.quantity ?? 1),
    unit,
    comment: (raw.comment as string | null) ?? null,
    packagingOptions: packagings.length
      ? packagings.map((p) => String(p.type ?? "EACH").toUpperCase())
      : [unit],
    unitPrice: Number.isFinite(cost) ? cost : null,
    currency: String(preferred?.currency ?? "GBP"),
  }
}

async function fetchCartRaw(businessId: string) {
  return apiFetch<{
    cart: Record<string, unknown>
    checkoutSupplierIds?: string[]
    checkoutGroups?: CheckoutGroup[]
    checkoutError?: string | null
  }>(`/api/businesses/${businessId}/cart`)
}

export async function getCart(businessId: string): Promise<{
  lines: CartLine[]
  checkoutSupplierIds: string[]
  checkoutGroups: CheckoutGroup[]
  checkoutError: string | null
}> {
  const data = await fetchCartRaw(businessId)
  const items = Array.isArray((data.cart as Record<string, unknown>).items)
    ? ((data.cart as Record<string, unknown>).items as Record<string, unknown>[])
    : []
  const checkoutSupplierIds = Array.isArray(data.checkoutSupplierIds)
    ? data.checkoutSupplierIds.map(String).filter(Boolean)
    : []
  const checkoutGroups = Array.isArray(data.checkoutGroups)
    ? (data.checkoutGroups as CheckoutGroup[])
    : []
  const checkoutError =
    typeof data.checkoutError === "string" ? data.checkoutError : null
  return {
    lines: items.map(mapCartLine),
    checkoutSupplierIds,
    checkoutGroups,
    checkoutError,
  }
}

export async function addCartItem(
  businessId: string,
  input: {
    productId: string
    quantity?: number
    unit?: string
    offerId?: string
  }
) {
  return apiFetch(`/api/businesses/${businessId}/cart/items`, {
    method: "POST",
    body: input,
  })
}

export async function updateCartItem(
  businessId: string,
  itemId: string,
  input: { quantity?: number; unit?: string; comment?: string | null }
) {
  return apiFetch(`/api/businesses/${businessId}/cart/items/${itemId}`, {
    method: "PATCH",
    body: input,
  })
}

export async function removeCartItem(businessId: string, itemId: string) {
  return apiFetch(`/api/businesses/${businessId}/cart/items/${itemId}`, {
    method: "DELETE",
  })
}

export async function clearCart(businessId: string) {
  return apiFetch(`/api/businesses/${businessId}/cart`, { method: "DELETE" })
}

export type CheckoutInput = {
  requestedDeliveryDate: string
  fulfillmentMethod?: "delivery" | "collection"
  deliveryTime?: string | null
  specialNote?: string | null
}

export type PlacedOrder = {
  id: string
  orderNumber: string
  supplierName: string | null
  itemCount: number
  publicUrl: string | null
}

/** Tedarikçi başına sipariş oluşur — dönen liste genelde 1 elemanlıdır. */
export async function checkoutCart(
  businessId: string,
  input: CheckoutInput
): Promise<PlacedOrder[]> {
  const data = await apiFetch<{
    orders: Record<string, unknown>[]
  }>(`/api/businesses/${businessId}/cart/checkout`, {
    method: "POST",
    body: input,
  })

  return (data.orders ?? []).map((raw) => {
    const supplier = (raw.supplier ?? {}) as Record<string, unknown>
    const items = Array.isArray(raw.items) ? raw.items : []
    return {
      id: asId(raw._id),
      orderNumber: String(raw.orderNumber ?? ""),
      supplierName: (supplier.name as string | null) ?? null,
      itemCount: items.length,
      publicUrl: (raw.publicUrl as string | null) ?? null,
    }
  })
}
