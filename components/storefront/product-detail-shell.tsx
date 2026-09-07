"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { AuthGateProvider } from "@/components/storefront/auth-gate"
import { ProductOrderPanel } from "@/components/storefront/product-order-panel"
import { StorefrontCartPanel } from "@/components/storefront/storefront-cart-panel"
import { StorefrontCategoryNav } from "@/components/storefront/storefront-category-nav"
import { StorefrontTopBar } from "@/components/storefront/storefront-top-bar"
import type { CatalogCategory, CatalogProductDetail } from "@/lib/api/catalog"
import {
  ProductDetailGallery,
  ProductDetailSections,
} from "@/components/storefront/product-detail-sections"
import type { CartLine, CartPricing } from "@/lib/api/cart"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useState } from "react"

type ProductDetailShellProps = {
  product: CatalogProductDetail
  isAuthenticated: boolean
  canOrder: boolean
  businessId: string | null
  businessName: string | null
  businessStatus: string | null
  userName?: string | null
  businesses?: Array<{ id: string; name: string; postcode: string }>
  cartLines: CartLine[]
  cartPricing?: CartPricing | null
  categories: CatalogCategory[]
}

function SpecRow({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value?.trim()) return null
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--sidebar-border)] py-2.5 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium text-[var(--brand-navy)]">
        {value}
      </dd>
    </div>
  )
}

export function ProductDetailShell({
  product,
  isAuthenticated,
  canOrder,
  businessId,
  businessName,
  businessStatus,
  userName,
  businesses = [],
  cartLines,
  cartPricing = null,
  categories,
}: ProductDetailShellProps) {
  const t = useT()
  const [cartOpen, setCartOpen] = useState(false)
  const meta =
    [product.brand, product.packSize || product.sizeLabel]
      .filter(Boolean)
      .join(" · ") || null
  const units = product.packagingOptions.join(" · ")

  return (
    <AuthGateProvider
      isAuthenticated={isAuthenticated}
      canOrder={canOrder}
      businessId={businessId}
      businessStatus={businessStatus}
    >
      <div className="flex min-h-svh flex-col bg-[#f7f7f8]">
        <StorefrontTopBar
          businesses={businesses}
          activeBusinessId={businessId}
          userName={userName}
          cartCount={cartLines.length}
          onOpenCart={() => setCartOpen(true)}
        />

        <div className="mx-auto flex w-full max-w-[1440px] flex-1">
          <div className="hidden w-[260px] shrink-0 border-r border-[var(--sidebar-border)] bg-background lg:block">
            <div className="sticky top-16 h-[calc(100svh-4rem)]">
              <StorefrontCategoryNav
                categories={categories}
                businessName={businessName}
              />
            </div>
          </div>

          <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-6">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--brand-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <ArrowLeft className="size-4" />
              {t("storefront.backToCatalog")}
            </Link>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0 space-y-4">
                <div className="border border-[var(--sidebar-border)] bg-background">
                  <ProductDetailGallery product={product} />

                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <p className="font-mono text-xs text-muted-foreground">
                      {product.itemCode}
                    </p>
                    <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--brand-navy)] sm:text-2xl">
                      {product.name}
                    </h1>
                    {meta ? (
                      <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
                    ) : null}

                    {product.ageRestricted ? (
                      <p className="mt-3 border-l-2 border-amber-600 pl-3 text-sm text-foreground">
                        {t("storefront.ageRestrictedHint")}
                      </p>
                    ) : null}
                  </div>
                </div>

                <section className="border border-[var(--sidebar-border)] bg-background px-4 py-4 sm:px-5">
                  <h2 className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
                    {t("storefront.productSpec")}
                  </h2>
                  <dl>
                    <SpecRow label={t("storefront.sku")} value={product.itemCode} />
                    <SpecRow label={t("storefront.brand")} value={product.brand} />
                    <SpecRow
                      label={t("storefront.packSize")}
                      value={product.packSize || product.sizeLabel}
                    />
                    <SpecRow
                      label={t("storefront.availableUnits")}
                      value={units || null}
                    />
                    <SpecRow
                      label={t("storefront.category")}
                      value={product.categoryName}
                    />
                    <SpecRow
                      label={t("storefront.barcode")}
                      value={product.barcode}
                    />
                    <SpecRow
                      label={t("storefront.storage")}
                      value={product.storage}
                    />
                    <SpecRow
                      label={t("storefront.unitOfMeasure")}
                      value={product.unitOfMeasure}
                    />
                  </dl>
                </section>

                <ProductDetailSections product={product} />

                <div className="xl:hidden">
                  <ProductOrderPanel
                    product={product}
                    businessId={businessId}
                  />
                </div>
              </div>

              <div className="hidden xl:block">
                <ProductOrderPanel
                  product={product}
                  businessId={businessId}
                  sticky
                />
              </div>
            </div>
          </main>

          <div className="hidden w-[300px] shrink-0 border-l border-[var(--sidebar-border)] xl:block">
            <div className="sticky top-16 h-[calc(100svh-4rem)]">
              <StorefrontCartPanel
                lines={cartLines}
                businessId={businessId}
                pricing={cartPricing}
              />
            </div>
          </div>
        </div>

        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent
            side="right"
            className="w-full max-w-[min(100vw,360px)] border-l border-[var(--sidebar-border)] p-0 sm:max-w-[360px]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{t("storefront.yourCart")}</SheetTitle>
            </SheetHeader>
            <StorefrontCartPanel
              lines={cartLines}
              businessId={businessId}
              className="h-full border-0"
              pricing={cartPricing}
            />
          </SheetContent>
        </Sheet>
      </div>
    </AuthGateProvider>
  )
}
