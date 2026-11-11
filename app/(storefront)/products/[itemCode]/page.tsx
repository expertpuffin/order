import { notFound, redirect } from "next/navigation"

import { ProductDetailShell } from "@/components/storefront/product-detail-shell"
import { getProductByItemCode, listCategories } from "@/lib/api/catalog"
import { itemCodeForUrl, productPagePath } from "@/lib/storefront-paths"
import { getStorefrontSession } from "@/lib/storefront-session"

type ProductPageProps = {
  params: Promise<{ itemCode: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { itemCode: rawCode } = await params
  // Next hands the segment still percent-encoded; decode once, here
  const decoded = decodeURIComponent(rawCode)
  const itemCode = itemCodeForUrl(decoded)
  if (decoded !== itemCode) redirect(productPagePath(itemCode))

  const session = await getStorefrontSession()

  const [product, categories] = await Promise.all([
    getProductByItemCode(itemCode),
    listCategories(),
  ])

  if (!product) notFound()

  return (
    <ProductDetailShell
      product={product}
      session={session}
      categories={categories}
    />
  )
}
