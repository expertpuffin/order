import {
  History,
  LayoutDashboard,
  ShoppingCart,
  Star,
  Store,
  type LucideIcon,
} from "lucide-react"

import type { TeamPermission } from "@/lib/types"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** Bu yetkilerden herhangi biri yeterli; boşsa üyelik yeterli */
  permission?: TeamPermission | TeamPermission[]
}

export type NavGroup = { id: string; label: string; items: NavItem[] }

export const mainNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "order",
    label: "Order",
    items: [
      { title: "Catalog", href: "/catalog", icon: Store, permission: "orders" },
      { title: "Cart", href: "/cart", icon: ShoppingCart, permission: "orders" },
      { title: "Favourites", href: "/favourites", icon: Star, permission: "orders" },
    ],
  },
  {
    id: "history",
    label: "History",
    items: [
      { title: "Orders", href: "/orders", icon: History },
    ],
  },
]

export const mainNav: NavItem[] = mainNavGroups.flatMap((group) => group.items)
