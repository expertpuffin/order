## / (Storefront home — header context)
Entry: `app/(storefront)/page.tsx`
Dependencies:
- `components/storefront/market-shell.tsx`
  - `components/storefront/storefront-top-bar.tsx`  ← HEADER TARGET
    - `components/storefront/delivery-business-picker.tsx`
    - `components/storefront/storefront-locale-menu.tsx`
    - `components/storefront/storefront-user-menu.tsx`
    - `components/storefront/auth-gate.tsx`
    - `components/ui/button.tsx`
    - `components/ui/input.tsx`
  - `components/storefront/storefront-category-nav.tsx`
  - `components/storefront/storefront-cart-panel.tsx`
  - `components/storefront/product-card.tsx`

## /products/[itemCode]
Entry: `app/(storefront)/products/[itemCode]/page.tsx`
Dependencies:
- `components/storefront/product-detail-shell.tsx`
  - `components/storefront/storefront-top-bar.tsx`  ← same header
