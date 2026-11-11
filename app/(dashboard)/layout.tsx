import { redirect } from "next/navigation"

import { StorefrontFrame } from "@/components/storefront/storefront-frame"
import { authGateHref } from "@/lib/auth-gate-url"
import { getStorefrontSession } from "@/lib/storefront-session"
import { ONBOARDING_PATHS } from "@/lib/storefront-paths"

/** Account pages (orders, cart, favourites, account, help): signed in, with a business. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getStorefrontSession()
  if (!session.user) redirect(authGateHref({ tab: "login", next: "/account" }))
  if (!session.businessId) redirect(ONBOARDING_PATHS.start)

  return <StorefrontFrame session={session}>{children}</StorefrontFrame>
}
