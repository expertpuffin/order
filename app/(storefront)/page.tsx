import { MarketShell } from "@/components/storefront/market-shell"
import { listHomeBanners } from "@/lib/api/app-content"
import {
  listCategories,
  listOfferProducts,
  listProducts,
} from "@/lib/api/catalog"
import { getLocale } from "@/lib/i18n"
import { getStorefrontSession } from "@/lib/storefront-session"

type PageProps = {
  searchParams: Promise<{
    q?: string
    category?: string
    page?: string
    view?: string
  }>
}

async function MarketPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const view = params.view
  const isHome = !params.q && !params.category && !view
  const session = await getStorefrontSession()
  const locale = await getLocale()

  const [categories, banners] = await Promise.all([
    listCategories(),
    isHome ? listHomeBanners(locale) : Promise.resolve([]),
  ])

  if (!isHome) {
    if (view === "offers") {
      const offerProducts = await listOfferProducts(48)
      return (
        <MarketShell
          mode="browse"
          isAuthenticated={Boolean(session.user)}
          canOrder={session.canOrder}
          businessId={session.businessId}
          businessName={session.businessName}
          businessStatus={session.businessStatus}
          userName={session.user?.name ?? null}
          activeBusinessId={session.businessId}
          businesses={session.businesses}
          cartLines={session.cartLines}
          categories={categories}
          products={offerProducts}
          pagination={{
            page: 1,
            limit: offerProducts.length || 24,
            total: offerProducts.length,
            pages: 1,
          }}
          banners={[]}
          rails={[]}
          q={params.q}
          category={params.category}
          activeView="offers"
        />
      )
    }

    const { products, pagination } = await listProducts({
      q: params.q,
      categorySlug: params.category,
      page,
      limit: 24,
    })

    return (
      <MarketShell
        mode="browse"
        isAuthenticated={Boolean(session.user)}
        canOrder={session.canOrder}
        businessId={session.businessId}
        businessName={session.businessName}
        businessStatus={session.businessStatus}
        userName={session.user?.name ?? null}
        activeBusinessId={session.businessId}
        businesses={session.businesses}
        cartLines={session.cartLines}
        categories={categories}
        products={products}
        pagination={pagination}
        banners={[]}
        rails={[]}
        q={params.q}
        category={params.category}
        activeView={view === "all" ? "all" : undefined}
      />
    )
  }

  const [pool, offers] = await Promise.all([
    listProducts({ page: 1, limit: 36 }),
    listOfferProducts(12),
  ])

  const picked = pool.products.slice(0, 12)
  const bestsellers = pool.products.slice(12, 24)

  const rails = [
    {
      id: "picked",
      titleKey: "storefront.railPicked" as const,
      seeAllHref: "/?view=all",
      products: picked,
    },
    {
      id: "bestsellers",
      titleKey: "storefront.railBestsellers" as const,
      seeAllHref: "/?view=all&page=2",
      products: bestsellers.length ? bestsellers : picked,
    },
    {
      id: "offers",
      titleKey: "storefront.railOffers" as const,
      seeAllHref: "/?view=offers",
      products: offers,
    },
  ].filter((rail) => rail.products.length > 0)

  return (
    <MarketShell
      mode="home"
      isAuthenticated={Boolean(session.user)}
      canOrder={session.canOrder}
      businessId={session.businessId}
      businessName={session.businessName}
      businessStatus={session.businessStatus}
      userName={session.user?.name ?? null}
      activeBusinessId={session.businessId}
      businesses={session.businesses}
      cartLines={session.cartLines}
      categories={categories}
      products={[]}
      pagination={{ page: 1, limit: 24, total: 0, pages: 0 }}
      banners={banners}
      rails={rails}
      q={params.q}
      category={params.category}
    />
  )
}

export default MarketPage
