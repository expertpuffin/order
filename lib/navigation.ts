import { History, ShoppingCart, Star, Store, type LucideIcon } from "lucide-react"

export type NavItem = {
  titleKey: string
  href: string
  icon: LucideIcon
  /** Shown only to members who can place orders for the active business. */
  ordering?: boolean
}

export const mainNav: NavItem[] = [
  { titleKey: "nav.catalog", href: "/", icon: Store, ordering: true },
  { titleKey: "nav.cart", href: "/cart", icon: ShoppingCart, ordering: true },
  { titleKey: "nav.favourites", href: "/favourites", icon: Star, ordering: true },
  { titleKey: "nav.orders", href: "/orders", icon: History },
]
