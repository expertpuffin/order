# Routes — Ordoria Business Order

| Path | File | Layout / shell |
|------|------|----------------|
| `/` | `app/(storefront)/page.tsx` | MarketShell + StorefrontTopBar |
| `/products/[itemCode]` | `app/(storefront)/products/[itemCode]/page.tsx` | ProductDetailShell + StorefrontTopBar |
| `/cart` | `app/(dashboard)/cart/page.tsx` | Dashboard layout |
| `/orders` | `app/(dashboard)/orders/page.tsx` | Dashboard layout |
| `/favourites` | `app/(dashboard)/favourites/page.tsx` | Dashboard layout |
| `/login` | `app/(auth)/login/page.tsx` | Auth |
| `/register` | `app/(auth)/register/page.tsx` | Auth |

Header redesign target: storefront `StorefrontTopBar` on `/` and product pages.
