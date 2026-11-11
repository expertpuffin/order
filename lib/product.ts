import type { CatalogProduct } from "@/lib/api/catalog"

/** The line under a product name: "Brand · 12×330ml"; empty when neither is known. */
export function productMeta(product: Pick<CatalogProduct, "brand" | "packSize" | "sizeLabel">) {
  return [product.brand, product.packSize || product.sizeLabel].filter(Boolean).join(" · ")
}
