import { MarketShell } from "@/components/storefront/market-shell"
import { listHomeBanners } from "@/lib/api/app-content"
import {
  listCategories,
  listOfferProducts,
  listProducts,
} from "@/lib/api/catalog"
import { getLocale } from "@/lib/i18n"
import { getStorefrontSession } from "@/lib/storefront-session"
import { storefrontHref } from "@/lib/storefront-paths"
import { PRODUCT_PAGE_SIZE } from "@/lib/storefront-paths"

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
          session={session}
          categories={categories}
          content={{ mode: "browse", products: offerProducts, pagination: null, offers: true }}
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
      limit: PRODUCT_PAGE_SIZE,
    })

    return (
      <MarketShell
        session={session}
        categories={categories}
        content={{ mode: "browse", products, pagination, offers: false }}
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
      seeAllHref: storefrontHref({ view: "all" }),
      products: picked,
    },
    {
      id: "bestsellers",
      titleKey: "storefront.railBestsellers" as const,
      seeAllHref: storefrontHref({ view: "all" }),
      products: bestsellers.length ? bestsellers : picked,
    },
    {
      id: "offers",
      titleKey: "storefront.railOffers" as const,
      seeAllHref: storefrontHref({ view: "offers" }),
      products: offers,
    },
  ].filter((rail) => rail.products.length > 0)

  return (
    <MarketShell
      session={session}
      categories={categories}
      content={{ mode: "home", banners, rails }}
      q={params.q}
      category={params.category}
    />
  )
}

export default MarketPage
