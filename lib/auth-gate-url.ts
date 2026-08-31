/** Storefront auth entry — modal only (no /login or /register pages). */
export function authGateHref(opts?: {
  tab?: "login" | "register"
  next?: string
}) {
  const params = new URLSearchParams()
  params.set("auth", opts?.tab ?? "login")
  if (opts?.next?.startsWith("/") && !opts.next.startsWith("//")) {
    params.set("next", opts.next)
  }
  return `/?${params.toString()}`
}
