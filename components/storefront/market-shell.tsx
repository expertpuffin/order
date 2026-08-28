"use client"

import { useState } from "react"

import { useT } from "@/components/i18n/i18n-provider"
import { AuthGateProvider } from "@/components/storefront/auth-gate"
import { BannerCarousel } from "@/components/storefront/banner-carousel"
import { CategoryIconRail } from "@/components/storefront/category-icon-rail"
import { ProductRail } from "@/components/storefront/product-rail"
import { ProductCard } from "@/components/storefront/product-card"
import { StorefrontTopBar } from "@/components/storefront/storefront-top-bar"
import { StorefrontCategoryNav } from "@/components/storefront/storefront-category-nav"
import { StorefrontCartPanel } from "@/components/storefront/storefront-cart-panel"
import type { MarketBanner } from "@/lib/api/app-content"
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogPagination,
} from "@/lib/api/catalog"
import type { CartLine } from "@/lib/api/cart"
import { ListPagination } from "@/components/shared/list-filter-bar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type MarketRail = {
  id: string
  title?: string
  titleKey?:
    | "storefront.railPicked"
    | "storefront.railBestsellers"
    | "storefront.railOffers"
  seeAllHref: string
  products: CatalogProduct[]
}

type MarketShellProps = {
  mode: "home" | "browse"
  isAuthenticated: boolean
  canOrder: boolean
  businessId: string | null
  businessName: string | null
  businessStatus: string | null
  userName?: string | null
  activeBusinessId?: string | null
  businesses?: Array<{ id: string; name: string; postcode: string }>
  cartLines: CartLine[]
  categories: CatalogCategory[]
  products: CatalogProduct[]
  pagination: CatalogPagination
  banners: MarketBanner[]
  rails: MarketRail[]
  q?: string
  category?: string
  activeView?: "offers" | "all"
}

export function MarketShell({
  mode,
  isAuthenticated,
  canOrder,
  businessId,
  businessName,
  businessStatus,
  userName,
  activeBusinessId,
  businesses = [],
  cartLines,
  categories,
  products,
  pagination,
  banners,
  rails,
  q,
  category,
  activeView,
}: MarketShellProps) {
  const t = useT()
  const [catsOpen, setCatsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <AuthGateProvider
      isAuthenticated={isAuthenticated}
      canOrder={canOrder}
      businessId={businessId}
      businessStatus={businessStatus}
    >
      <div className="flex min-h-svh flex-col bg-white">
        <StorefrontTopBar
          businesses={businesses}
          activeBusinessId={activeBusinessId ?? businessId}
          userName={userName}
          q={q}
          cartCount={cartLines.length}
          onOpenCart={() => setCartOpen(true)}
          onOpenCategories={() => setCatsOpen(true)}
        />

        <div className="mx-auto flex w-full max-w-[1440px] flex-1">
          <div className="hidden w-[260px] shrink-0 border-r bg-white lg:block">
            <div className="sticky top-16 h-[calc(100svh-4rem)]">
              <StorefrontCategoryNav
                categories={categories}
                activeSlug={category}
                businessName={businessName}
              />
            </div>
          </div>

          <main className="min-w-0 flex-1 bg-[#f7f7f8] px-3 py-4 sm:px-5 lg:px-6">
            {mode === "home" ? (
              <div className="space-y-6">
                <BannerCarousel
                  banners={banners}
                  fallbackTitle={t("storefront.heroTitle")}
                  fallbackSubtitle={t("storefront.heroSubtitle")}
                />

                <CategoryIconRail
                  categories={categories}
                  activeSlug={category}
                  activeView={activeView}
                />

                <div className="space-y-8 rounded-2xl bg-white p-3 sm:p-4">
                  {rails.map((rail) => (
                    <ProductRail
                      key={rail.id}
                      title={
                        rail.titleKey
                          ? t(rail.titleKey)
                          : rail.title || t("storefront.allProducts")
                      }
                      seeAllHref={rail.seeAllHref}
                      seeAllLabel={t("storefront.seeAll")}
                      products={rail.products}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CategoryIconRail
                  categories={categories}
                  activeSlug={category}
                  activeView={activeView}
                />

                {activeView === "offers" ? (
                  <h1 className="text-xl font-bold text-[var(--brand-navy)]">
                    {t("storefront.railOffers")}
                  </h1>
                ) : null}

                {products.length === 0 ? (
                  <div className="rounded-2xl border bg-white py-16 text-center text-sm text-muted-foreground">
                    {t("storefront.noProducts")}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {activeView !== "offers" ? (
                  <ListPagination
                    basePath="/"
                    pagination={pagination}
                    searchParams={{ q, category }}
                  />
                ) : null}
              </div>
            )}
          </main>

          <div className="hidden w-[320px] shrink-0 xl:block">
            <div className="sticky top-16 h-[calc(100svh-4rem)]">
              <StorefrontCartPanel lines={cartLines} businessId={businessId} />
            </div>
          </div>
        </div>

        <Sheet open={catsOpen} onOpenChange={setCatsOpen}>
          <SheetContent side="left" className="w-[300px] p-0 sm:max-w-[300px]">
            <StorefrontCategoryNav
              categories={categories}
              activeSlug={category}
              businessName={businessName}
            />
          </SheetContent>
        </Sheet>

        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent side="bottom" className="h-[85svh] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("storefront.yourCart")}</SheetTitle>
            </SheetHeader>
            <StorefrontCartPanel
              lines={cartLines}
              businessId={businessId}
              className="h-full border-0"
            />
          </SheetContent>
        </Sheet>
      </div>
    </AuthGateProvider>
  )
}
