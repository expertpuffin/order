import { safeNextPath } from "@/lib/safe-redirect"

/** Storefront auth entry — modal only (no /login or /register pages). */
export function authGateHref(opts?: {
  tab?: "login" | "register"
  next?: string
}) {
  const params = new URLSearchParams()
  params.set("auth", opts?.tab ?? "login")
  const next = safeNextPath(opts?.next, "")
  if (next) params.set("next", next)
  return `/?${params.toString()}`
}
