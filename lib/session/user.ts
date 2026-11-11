import { asId } from "@/lib/domain"

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  isEmailVerified: boolean
}

function personName(raw: Record<string, unknown>): string {
  if (raw.name) return String(raw.name)
  const first = String(raw.firstName ?? "").trim()
  const last = String(raw.lastName ?? "").trim()
  return [first, last].filter(Boolean).join(" ") || "—"
}

export function mapUser(raw: Record<string, unknown>): User {
  return {
    id: asId(raw._id ?? raw.id),
    name: personName(raw),
    email: String(raw.email ?? ""),
    phone: (raw.phone as string | null) ?? null,
    isEmailVerified: Boolean(raw.isEmailVerified),
  }
}
