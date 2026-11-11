import { apiFetch } from "@/lib/api/client"
import { asId, type BusinessStatus } from "@/lib/domain"

/** Team permissions: a flat list, no read/manage split. */
export type TeamPermission = "orders" | "orders_approve" | "inventory" | "billing" | "team" | "settings"

export type MerchantBusiness = {
  id: string
  businessNumber: string
  businessName: string
  tradingName: string
  businessType: string
  addressLine1: string
  addressLine2: string
  city: string
  county: string
  postcode: string
  contactName: string
  contactPhone: string
  openTime: string
  closeTime: string
  deliveryTime: string | null
  status: BusinessStatus
  /** What the signed-in member may do in this business */
  permissions: TeamPermission[]
}

function contactName(raw: Record<string, unknown>): string {
  if (raw.contactName) return String(raw.contactName)
  const first = String(raw.contactFirstName ?? "").trim()
  const last = String(raw.contactLastName ?? "").trim()
  return [first, last].filter(Boolean).join(" ")
}

function mapMemberBusiness(raw: Record<string, unknown>): MerchantBusiness {
  const address = (raw.address ?? {}) as Record<string, unknown>
  return {
    id: asId(raw._id ?? raw.id),
    businessNumber: String(raw.businessNumber ?? ""),
    businessName: String(raw.businessName ?? ""),
    tradingName: String(raw.tradingName ?? ""),
    businessType: String(raw.businessType ?? ""),
    addressLine1: String(address.line_1 ?? ""),
    addressLine2: String(address.line_2 ?? ""),
    city: String(address.post_town ?? ""),
    county: String(address.county ?? ""),
    postcode: String(address.postcode ?? ""),
    contactName: contactName(raw),
    contactPhone: String(raw.contactPhone ?? ""),
    openTime: String(raw.openTime ?? ""),
    closeTime: String(raw.closeTime ?? ""),
    deliveryTime: (raw.deliveryTime as string | null) ?? null,
    status: (raw.status as BusinessStatus) ?? "pending",
    permissions: Array.isArray(raw.myPermissions) ? (raw.myPermissions.map(String) as TeamPermission[]) : [],
  }
}

export async function getMyBusinesses(): Promise<MerchantBusiness[]> {
  const data = await apiFetch<{ businesses: Record<string, unknown>[] }>("/api/businesses/mine")
  return (data.businesses ?? []).map(mapMemberBusiness)
}

/** Shown wherever a business is named: trading name first. */
export function businessDisplayName(business: Pick<MerchantBusiness, "tradingName" | "businessName">) {
  return business.tradingName || business.businessName
}
