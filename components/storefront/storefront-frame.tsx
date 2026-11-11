"use client"

import { useState, type ReactNode } from "react"

import { CartPanel } from "@/components/cart/cart-panel"
import { useT } from "@/components/i18n/i18n-provider"
import { AuthGateProvider } from "@/components/storefront/auth-gate"
import { StorefrontCategoryNav } from "@/components/storefront/storefront-category-nav"
import { StorefrontTopBar } from "@/components/storefront/storefront-top-bar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { CatalogCategory } from "@/lib/api/catalog"
import type { StorefrontSession } from "@/lib/storefront-session"

/**
 * Every storefront page's frame: the auth gate, the top bar and, on catalogue
 * pages (`categories` given), the category nav and the cart beside the content,
 * as sheets on small screens. Account pages get the top bar over a narrow column.
 */
export function StorefrontFrame({
  session,
  categories,
  activeCategory,
  q,
  children,
}: {
  session: StorefrontSession
  categories?: CatalogCategory[]
  activeCategory?: string
  q?: string
  children: ReactNode
}) {
  const t = useT()
  const [catsOpen, setCatsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const catalogue = Boolean(categories)

  const categoryNav = categories ? (
    <StorefrontCategoryNav categories={categories} activeSlug={activeCategory} businessName={session.businessName} />
  ) : null
  const cart = (className?: string) => (
    <CartPanel lines={session.cartLines} businessId={session.businessId} pricing={session.cartPricing} className={className} />
  )

  return (
    <AuthGateProvider
      isAuthenticated={Boolean(session.user)}
      canOrder={session.canOrder}
      businessId={session.businessId}
      businessStatus={session.businessStatus}
    >
      <div className="flex min-h-svh flex-col bg-[#f7f7f8]">
        <StorefrontTopBar
          businesses={session.businesses}
          activeBusinessId={session.businessId}
          userName={session.user?.name ?? null}
          q={q}
          cartCount={session.cartLines.length}
          onOpenCart={catalogue ? () => setCartOpen(true) : undefined}
          onOpenCategories={catalogue ? () => setCatsOpen(true) : undefined}
        />

        {catalogue ? (
          <div className="mx-auto flex w-full max-w-[1440px] flex-1">
            <div className="hidden w-[260px] shrink-0 border-r border-[var(--border-subtle)] bg-background lg:block">
              <div className="sticky top-16 h-[calc(100svh-4rem)]">{categoryNav}</div>
            </div>
            <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-6">{children}</main>
            <div className="hidden w-[300px] shrink-0 border-l border-[var(--border-subtle)] bg-background xl:block">
              <div className="sticky top-16 h-[calc(100svh-4rem)]">{cart()}</div>
            </div>
          </div>
        ) : (
          <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-5 sm:px-6">{children}</main>
        )}

        {catalogue ? (
          <>
            <Sheet open={catsOpen} onOpenChange={setCatsOpen}>
              <SheetContent side="left" className="w-[300px] p-0 sm:max-w-[300px]">
                {categoryNav}
              </SheetContent>
            </Sheet>
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetContent
                side="right"
                className="w-full max-w-[min(100vw,360px)] border-l border-[var(--border-subtle)] p-0 sm:max-w-[360px]"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>{t("storefront.yourCart")}</SheetTitle>
                </SheetHeader>
                {cart("h-full border-0")}
              </SheetContent>
            </Sheet>
          </>
        ) : null}
      </div>
    </AuthGateProvider>
  )
}
