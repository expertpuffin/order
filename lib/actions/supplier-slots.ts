"use server"

import {
  fetchSupplierAvailability,
  fetchSupplierSlots,
  type FulfillmentMethod,
} from "@/lib/api/supplierFulfillment"

export async function loadSupplierAvailability(
  supplierId: string,
  method: FulfillmentMethod,
  opts?: {
    from?: string
    days?: number
    postcode?: string | null
    businessId?: string | null
  }
) {
  return fetchSupplierAvailability(supplierId, method, opts)
}

export async function loadSupplierSlots(
  supplierId: string,
  method: FulfillmentMethod,
  date: string,
  opts?: { postcode?: string | null; businessId?: string | null }
) {
  return fetchSupplierSlots(supplierId, method, date, opts)
}
