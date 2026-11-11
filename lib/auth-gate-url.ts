import { safeNextPath } from "@/lib/safe-redirect"
import { ONBOARDING_PATHS } from "@/lib/storefront-paths"

/** Signing in happens in a modal on the storefront (no /login or /register pages), opened by `?auth=`. */

export type AuthTab = "login" | "register"

/** After sign-in from a plain `?auth=login`, new users continue their onboarding. */
export const DEFAULT_NEXT = ONBOARDING_PATHS.start

export function authGateHref(opts?: { tab?: AuthTab; next?: string }) {
  const params = new URLSearchParams()
  params.set("auth", opts?.tab ?? "login")
  const next = safeNextPath(opts?.next, "")
  if (next) params.set("next", next)
  return `/?${params.toString()}`
}

/** The modal a URL asks for, or null. */
export function readAuthQuery(params: { get: (key: string) => string | null }): { tab: AuthTab; next: string } | null {
  const tab = params.get("auth")
  if (tab !== "login" && tab !== "register") return null
  return { tab, next: safeNextPath(params.get("next"), DEFAULT_NEXT) }
}

/** The same URL without the modal's parameters. */
export function withoutAuthQuery(url: URL) {
  url.searchParams.delete("auth")
  url.searchParams.delete("next")
  const qs = url.searchParams.toString()
  return qs ? `${url.pathname}?${qs}` : url.pathname
}
