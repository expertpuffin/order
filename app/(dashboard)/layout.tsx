import { redirect } from "next/navigation"

import { AuthGateProvider } from "@/components/storefront/auth-gate"
import { StorefrontTopBar } from "@/components/storefront/storefront-top-bar"
import { authGateHref } from "@/lib/auth-gate-url"
import { getStorefrontSession } from "@/lib/storefront-session"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getStorefrontSession()
  if (!session.user) redirect(authGateHref({ tab: "login", next: "/account" }))
  if (!session.businessId) redirect("/onboarding")

  return (
    <AuthGateProvider
      isAuthenticated
      canOrder={session.canOrder}
      businessId={session.businessId}
      businessStatus={session.businessStatus}
    >
      <div className="flex min-h-svh flex-col bg-[#f7f7f8]">
        <StorefrontTopBar
          businesses={session.businesses}
          activeBusinessId={session.businessId}
          userName={session.user.name}
          cartCount={session.cartLines.length}
          cartHref="/cart"
        />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-5 sm:px-6">
          {children}
        </main>
      </div>
    </AuthGateProvider>
  )
}
