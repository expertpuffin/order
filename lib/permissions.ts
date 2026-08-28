import type { TeamPermission } from "@/lib/types"

/** Takım yetkileri: manage/read ayrımı yok, düz liste. */
export function hasTeamPermission(
  permissions: TeamPermission[] | null | undefined,
  needed?: TeamPermission | TeamPermission[]
): boolean {
  if (!needed) return true
  if (!permissions?.length) return false
  const list = Array.isArray(needed) ? needed : [needed]
  return list.some((permission) => permissions.includes(permission))
}
