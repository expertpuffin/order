import { notFound, redirect } from "next/navigation"

import { ProductDetailShell } from "@/components/storefront/product-detail-shell"
import { getProductByItemCode, listCategories } from "@/lib/api/catalog"
import { productPagePath } from "@/lib/storefront-paths"
import { getStorefrontSession } from "@/lib/storefront-session"

type ProductPageProps = {
  params: Promise<{ itemCode: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { itemCode: rawCode } = await params
  const decoded = decodeURIComponent(rawCode).trim()
  const itemCode = decoded.toLowerCase()

  if (decoded !== itemCode) {
    redirect(productPagePath(itemCode))
  }

  const session = await getStorefrontSession()

  const [product, categories] = await Promise.all([
    getProductByItemCode(itemCode),
    listCategories(),
  ])

  if (!product) notFound()

  return (
    <ProductDetailShell
      product={product}
      isAuthenticated={Boolean(session.user)}
      canOrder={session.canOrder}
      businessId={session.businessId}
      businessName={session.businessName}
      businessStatus={session.businessStatus}
      userName={session.user?.name ?? null}
      businesses={session.businesses}
      cartLines={session.cartLines}
      categories={categories}
    />
  )
}
