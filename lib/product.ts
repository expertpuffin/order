import type { CatalogProduct } from "@/lib/api/catalog"

/** The line under a product name: "Brand · 12×330ml", or its item code when neither is known. */
export function productMeta(product: Pick<CatalogProduct, "brand" | "packSize" | "sizeLabel" | "itemCode">) {
  return [product.brand, product.packSize || product.sizeLabel].filter(Boolean).join(" · ") || product.itemCode
}
