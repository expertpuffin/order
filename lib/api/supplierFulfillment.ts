import { apiFetch } from "@/lib/api/client"

export type FulfillmentMethod = "collection" | "delivery"

export type AvailabilityDay = {
  date: string
  available: boolean
  reason: string | null
  slotCount: number
}

export type SlotsResponse = {
  supplierId: string
  method: FulfillmentMethod
  date: string
  available: boolean
  reason: string | null
  slots: string[]
  minOrderAmount: number | null
}

export async function fetchSupplierAvailability(
  supplierId: string,
  method: FulfillmentMethod,
  opts?: {
    from?: string
    days?: number
    postcode?: string | null
    businessId?: string | null
  }
) {
  return apiFetch<{
    supplierId: string
    method: FulfillmentMethod
    days: AvailabilityDay[]
  }>(`/api/suppliers/${supplierId}/availability`, {
    searchParams: {
      method,
      from: opts?.from,
      days: opts?.days ?? 14,
      postcode: opts?.postcode ?? undefined,
      businessId: opts?.businessId ?? undefined,
    },
  })
}

export async function fetchSupplierSlots(
  supplierId: string,
  method: FulfillmentMethod,
  date: string,
  opts?: { postcode?: string | null; businessId?: string | null }
) {
  return apiFetch<SlotsResponse>(`/api/suppliers/${supplierId}/slots`, {
    searchParams: {
      method,
      date,
      postcode: opts?.postcode ?? undefined,
      businessId: opts?.businessId ?? undefined,
    },
  })
}
