"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { DetailRow } from "@/components/shared/detail-row"
import { ProductDetailGallery, ProductDetailSections } from "@/components/storefront/product-detail-sections"
import { ProductOrderPanel } from "@/components/storefront/product-order-panel"
import { StorefrontFrame } from "@/components/storefront/storefront-frame"
import type { CatalogCategory, CatalogProductDetail } from "@/lib/api/catalog"
import { productMeta } from "@/lib/product"
import type { StorefrontSession } from "@/lib/storefront-session"

export function ProductDetailShell({
  product,
  session,
  categories,
}: {
  product: CatalogProductDetail
  session: StorefrontSession
  categories: CatalogCategory[]
}) {
  const t = useT()
  const businessId = session.businessId
  // The item code has its own line here, so no fallback to it
  const meta = productMeta(product)
  const units = product.packagingOptions.join(" · ")

  return (
    <StorefrontFrame session={session} categories={categories}>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--brand-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <ArrowLeft className="size-4" />
              {t("storefront.backToCatalog")}
            </Link>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0 space-y-4">
                <div className="border border-[var(--border-subtle)] bg-background">
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

                <section className="border border-[var(--border-subtle)] bg-background px-4 py-4 sm:px-5">
                  <h2 className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
                    {t("storefront.productSpec")}
                  </h2>
                  <div>
                    <DetailRow hideEmpty label={t("storefront.sku")} value={product.itemCode} />
                    <DetailRow hideEmpty label={t("storefront.brand")} value={product.brand} />
                    <DetailRow hideEmpty
                      label={t("storefront.packSize")}
                      value={product.packSize || product.sizeLabel}
                    />
                    <DetailRow hideEmpty
                      label={t("storefront.availableUnits")}
                      value={units || null}
                    />
                    <DetailRow hideEmpty
                      label={t("storefront.category")}
                      value={product.categoryName}
                    />
                    <DetailRow hideEmpty
                      label={t("storefront.barcode")}
                      value={product.barcode}
                    />
                    <DetailRow hideEmpty
                      label={t("storefront.storage")}
                      value={product.storage}
                    />
                    <DetailRow hideEmpty
                      label={t("storefront.unitOfMeasure")}
                      value={product.unitOfMeasure}
                    />
                  </div>
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
    </StorefrontFrame>
  )
}
