import { apiFetch } from "@/lib/api/client"
import type { TeamPermission } from "@/lib/types"

export type MerchantSubscription = {
  plan: string | null
  status: string | null
  startDate: string | null
  endDate: string | null
  trialMonths: number | null
  cancelAtPeriodEnd: boolean
}

export type MerchantRole = {
  id: string
  name: string
  permissions: TeamPermission[]
  isSystem: boolean
}

export type MerchantMember = {
  id: string
  userId: string | null
  email: string
  firstName: string
  lastName: string
  phone: string | null
  roleId: string | null
  status: "pending" | "active" | "inactive"
  joinedAt: string | null
  inviteExpiresAt: string | null
}

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
  mainBusinessEmail: string | null
  mainBusinessPhone: string | null
  openTime: string
  closeTime: string
  deliveryTime: string | null
  status: string
  createdAt: string
  subscription: MerchantSubscription | null
  roles: MerchantRole[]
  members: MerchantMember[]
}

function personLabel(raw: unknown): string {
  if (!raw || typeof raw !== "object") return ""
  const o = raw as Record<string, unknown>
  const first = String(o.contactFirstName ?? "").trim()
  const last = String(o.contactLastName ?? "").trim()
  return [first, last].filter(Boolean).join(" ")
}

function asId(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

function asDate(value: unknown): string | null {
  if (!value) return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function mapMerchantBusiness(
  raw: Record<string, unknown>
): MerchantBusiness {
  const address = (raw.address ?? {}) as Record<string, unknown>
  const sub = (raw.subscription ?? null) as Record<string, unknown> | null

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
    contactName: String(raw.contactName ?? "") || personLabel(raw),
    contactPhone: String(raw.contactPhone ?? ""),
    mainBusinessEmail: (raw.mainBusinessEmail as string | null) ?? null,
    mainBusinessPhone: (raw.mainBusinessPhone as string | null) ?? null,
    openTime: String(raw.openTime ?? ""),
    closeTime: String(raw.closeTime ?? ""),
    deliveryTime: (raw.deliveryTime as string | null) ?? null,
    status: String(raw.status ?? "pending"),
    createdAt: asDate(raw.createdAt) ?? "",
    subscription: sub
      ? {
          plan: sub.plan != null ? String(sub.plan) : null,
          status: sub.status != null ? String(sub.status) : null,
          startDate: asDate(sub.startDate),
          endDate: asDate(sub.endDate),
          trialMonths:
            sub.trialMonths != null ? Number(sub.trialMonths) : null,
          cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
        }
      : null,
    roles: Array.isArray(raw.roles)
      ? raw.roles.map((r) => {
          const row = r as Record<string, unknown>
          return {
            id: asId(row._id ?? row.id),
            name: String(row.name ?? ""),
            permissions: Array.isArray(row.permissions)
              ? (row.permissions.map(String) as TeamPermission[])
              : [],
            isSystem: Boolean(row.isSystem),
          }
        })
      : [],
    members: Array.isArray(raw.members)
      ? raw.members.map((m) => {
          const row = m as Record<string, unknown>
          return {
            id: asId(row._id ?? row.id),
            userId: row.userId ? asId(row.userId) : null,
            email: String(row.email ?? "").toLowerCase(),
            firstName: String(row.firstName ?? ""),
            lastName: String(row.lastName ?? ""),
            phone: (row.phone as string | null) ?? null,
            roleId: row.roleId ? asId(row.roleId) : null,
            status: (row.status as MerchantMember["status"]) ?? "pending",
            joinedAt: asDate(row.joinedAt),
            inviteExpiresAt: asDate(row.inviteExpiresAt),
          }
        })
      : [],
  }
}

export async function getMyBusinesses(): Promise<
  Array<MerchantBusiness & { permissions: TeamPermission[] }>
> {
  const data = await apiFetch<{
    businesses: Record<string, unknown>[]
  }>("/api/businesses/mine")
  return (data.businesses ?? []).map((raw) => ({
    ...mapMerchantBusiness(raw),
    permissions: Array.isArray(raw.myPermissions)
      ? (raw.myPermissions.map(String) as TeamPermission[])
      : [],
  }))
}

export async function getMerchantBusiness(
  id: string
): Promise<MerchantBusiness & { permissions: TeamPermission[] }> {
  const data = await apiFetch<{
    business: Record<string, unknown>
    permissions: string[]
  }>(`/api/businesses/${id}`)
  return {
    ...mapMerchantBusiness(data.business),
    permissions: (data.permissions ?? []).map(String) as TeamPermission[],
  }
}
