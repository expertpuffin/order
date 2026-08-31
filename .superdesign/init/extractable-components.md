## StorefrontTopBar
- Source: `components/storefront/storefront-top-bar.tsx`
- Category: layout
- Description: Sticky storefront header with logo, delivery picker, search, auth, locale, favourites, cart
- Extractable props: cartCount (number, default: 0), userName (string|null), q (string), isAuthenticated (boolean)
- Hardcoded: Restoloop wordmark, /icon.png logo, Lucide icons (Menu, Search, Heart, ShoppingBag), Sign in / Sign up labels, rounded-full search field

## DeliveryBusinessPicker
- Source: `components/storefront/delivery-business-picker.tsx`
- Category: basic
- Description: Delivery address chip in the header
- Extractable props: activeBusinessLabel (string), isAuthenticated (boolean)
- Hardcoded: MapPin icon, “Delivery to” label styling
