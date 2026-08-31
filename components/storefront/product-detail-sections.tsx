"use client"

import type { ReactNode } from "react"

import { useT } from "@/components/i18n/i18n-provider"
import type { CatalogNutrition, CatalogProductDetail } from "@/lib/api/catalog"
import { cn } from "@/lib/utils"

function DetailSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  if (!children) return null
  return (
    <section
      className={cn(
        "border border-[var(--sidebar-border)] bg-background px-4 py-4 sm:px-5",
        className
      )}
    >
      <h2 className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
        {title}
      </h2>
      {children}
    </section>
  )
}

function AllergenTags({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="border border-[var(--sidebar-border)] bg-muted/30 px-2.5 py-1 text-xs font-medium text-[var(--brand-navy)]"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

function resolveAllergenLabels(
  product: CatalogProductDetail,
  t: (key: string) => string
): string[] {
  if (product.allergensNotApplicable) {
    return [t("storefront.allergensNotApplicable")]
  }
  if (product.allergensNone) {
    return [t("storefront.allergensNone")]
  }
  if (product.allergenChips.length) {
    return product.allergenChips.map((chip) => chip.label)
  }
  if (product.allergens?.trim()) {
    return product.allergens
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function NutritionTable({
  nutrition,
  note,
  t,
}: {
  nutrition: CatalogNutrition
  note: string | null
  t: (key: string, vars?: Record<string, string>) => string
}) {
  if (nutrition.notOnPack) {
    return (
      <p className="text-sm text-muted-foreground">
        {note?.trim() || t("storefront.nutritionNotOnPack")}
      </p>
    )
  }

  const basisKey =
    nutrition.basis === "perServing"
      ? "storefront.nutritionBasisServing"
      : nutrition.basisUnit === "ml"
        ? "storefront.nutritionBasis100ml"
        : "storefront.nutritionBasis100g"

  const rows: Array<{ label: string; value: string | null }> = [
    {
      label: t("storefront.nutritionEnergy"),
      value:
        nutrition.energyKcal != null ? `${nutrition.energyKcal} kcal` : null,
    },
    {
      label: t("storefront.nutritionFat"),
      value: formatMacro(nutrition.fat, nutrition.units.fat),
    },
    {
      label: t("storefront.nutritionSaturates"),
      value: formatMacro(nutrition.saturates, nutrition.units.saturates),
    },
    {
      label: t("storefront.nutritionCarbohydrate"),
      value: formatMacro(nutrition.carbohydrate, nutrition.units.carbohydrate),
    },
    {
      label: t("storefront.nutritionSugars"),
      value: formatMacro(nutrition.sugars, nutrition.units.sugars),
    },
    {
      label: t("storefront.nutritionFibre"),
      value: formatMacro(nutrition.fibre, nutrition.units.fibre),
    },
    {
      label: t("storefront.nutritionProtein"),
      value: formatMacro(nutrition.protein, nutrition.units.protein),
    },
    {
      label: t("storefront.nutritionSalt"),
      value: formatMacro(nutrition.salt, nutrition.units.salt),
    },
    ...nutrition.extras
      .filter((row) => row.value != null)
      .map((row) => ({
        label: row.label,
        value: formatMacro(row.value, row.unit),
      })),
  ].filter((row) => row.value)

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {note?.trim() || t("storefront.nutritionNotOnPack")}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {t(basisKey)}
      </p>
      <dl className="border border-[var(--sidebar-border)]">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={cn(
              "flex justify-between gap-4 px-3 py-2 text-sm",
              index > 0 && "border-t border-[var(--sidebar-border)]"
            )}
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium tabular-nums text-[var(--brand-navy)]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {note?.trim() ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      ) : null}
    </div>
  )
}

function formatMacro(value: number | null, unit: string) {
  if (value == null) return null
  return `${value}${unit ? ` ${unit}` : ""}`
}

type ProductDetailSectionsProps = {
  product: CatalogProductDetail
}

export function ProductDetailSections({ product }: ProductDetailSectionsProps) {
  const t = useT()
  const allergenLabels = resolveAllergenLabels(product, t)
  const bodyCopy =
    product.longDescription?.trim() ||
    product.description?.trim() ||
    null
  const hasIngredients =
    product.ingredientsNotApplicable || Boolean(product.ingredients?.trim())
  const hasNutrition =
    Boolean(product.nutrition) || Boolean(product.nutritionNote?.trim())

  return (
    <>
      <DetailSection title={t("storefront.description")}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {bodyCopy || t("storefront.noDescription")}
        </p>
      </DetailSection>

      {hasIngredients ? (
        <DetailSection title={t("storefront.ingredients")}>
          {product.ingredientsNotApplicable ? (
            <p className="text-sm text-muted-foreground">
              {t("storefront.ingredientsNotApplicable")}
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.ingredients}
            </p>
          )}
        </DetailSection>
      ) : null}

      {allergenLabels.length > 0 ? (
        <DetailSection title={t("storefront.allergens")}>
          <AllergenTags labels={allergenLabels} />
        </DetailSection>
      ) : null}

      {hasNutrition && product.nutrition ? (
        <DetailSection title={t("storefront.nutrition")}>
          <NutritionTable
            nutrition={product.nutrition}
            note={product.nutritionNote}
            t={t}
          />
        </DetailSection>
      ) : product.nutritionNote?.trim() ? (
        <DetailSection title={t("storefront.nutrition")}>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.nutritionNote}
          </p>
        </DetailSection>
      ) : null}
    </>
  )
}

export function ProductDetailGallery({
  product,
}: {
  product: CatalogProductDetail
}) {
  const images =
    product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [{ url: product.imageUrl, alt: product.name }]
        : []

  if (images.length <= 1) {
    const image = images[0]
    return (
      <div className="aspect-4/3 w-full border-b border-[var(--sidebar-border)] bg-muted/20 sm:aspect-[16/10]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.alt ?? product.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground/40">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-px border-b border-[var(--sidebar-border)] bg-[var(--sidebar-border)] sm:grid-cols-[minmax(0,1fr)_96px]">
      <div className="aspect-4/3 bg-muted/20 sm:aspect-[16/10]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0].url}
          alt={images[0].alt ?? product.name}
          className="size-full object-cover"
        />
      </div>
      <div className="grid max-h-full auto-rows-fr gap-px bg-[var(--sidebar-border)]">
        {images.slice(1, 4).map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.url}
            src={image.url}
            alt={image.alt ?? product.name}
            className="size-full min-h-0 object-cover bg-muted/20"
          />
        ))}
      </div>
    </div>
  )
}
