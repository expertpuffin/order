"use client"

import { useT } from "@/components/i18n/i18n-provider"
import { ListPagination } from "@/components/shared/list-filter-bar"
import { BannerCarousel } from "@/components/storefront/banner-carousel"
import { CategoryIconRail } from "@/components/storefront/category-icon-rail"
import { ProductCard } from "@/components/storefront/product-card"
import { ProductRail } from "@/components/storefront/product-rail"
import { StorefrontFrame } from "@/components/storefront/storefront-frame"
import type { MarketBanner } from "@/lib/api/app-content"
import type { CatalogCategory, CatalogPagination, CatalogProduct } from "@/lib/api/catalog"
import type { StorefrontSession } from "@/lib/storefront-session"

export type MarketRail = {
  id: string
  titleKey: "storefront.railPicked" | "storefront.railBestsellers" | "storefront.railOffers"
  seeAllHref: string
  products: CatalogProduct[]
}

/** Home shows banners and rails; browsing shows a product grid, paged unless it's the offers list. */
export type MarketContent =
  | { mode: "home"; banners: MarketBanner[]; rails: MarketRail[] }
  | { mode: "browse"; products: CatalogProduct[]; pagination: CatalogPagination | null; offers: boolean }

export function MarketShell({
  session,
  categories,
  content,
  q,
  category,
  activeView,
}: {
  session: StorefrontSession
  categories: CatalogCategory[]
  content: MarketContent
  q?: string
  category?: string
  activeView?: "offers" | "all"
}) {
  const t = useT()
  const iconRail = <CategoryIconRail categories={categories} activeSlug={category} activeView={activeView} />

  return (
    <StorefrontFrame session={session} categories={categories} activeCategory={category} q={q}>
      {content.mode === "home" ? (
        <div className="space-y-6">
          <BannerCarousel
            banners={content.banners}
            fallbackTitle={t("storefront.heroTitle")}
            fallbackSubtitle={t("storefront.heroSubtitle")}
          />
          {iconRail}
          <div className="space-y-8 rounded-[2px] border border-[var(--border-subtle)] bg-white p-3 sm:p-4">
            {content.rails.map((rail) => (
              <ProductRail
                key={rail.id}
                title={t(rail.titleKey)}
                seeAllHref={rail.seeAllHref}
                seeAllLabel={t("storefront.seeAll")}
                products={rail.products}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {iconRail}
          {content.offers ? <h1 className="text-xl font-bold text-[var(--brand-navy)]">{t("storefront.railOffers")}</h1> : null}
          {content.products.length === 0 ? (
            <div className="rounded-[2px] border border-[var(--border-subtle)] bg-white py-16 text-center text-sm text-muted-foreground">
              {t("storefront.noProducts")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {content.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {content.pagination ? (
            <ListPagination basePath="/" pagination={content.pagination} searchParams={{ q, category, view: activeView }} />
          ) : null}
        </div>
      )}
    </StorefrontFrame>
  )
}
