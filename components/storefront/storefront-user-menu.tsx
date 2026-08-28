"use client"

import Link from "next/link"
import { ChevronDown, CircleHelp, LogOut, UserRound } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import { logoutAction } from "@/lib/actions"
import { translateNavTitle } from "@/lib/i18n/nav-label"
import { mainNav } from "@/lib/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type StorefrontUserMenuProps = {
  userName: string
  className?: string
}

export function StorefrontUserMenu({
  userName,
  className,
}: StorefrontUserMenuProps) {
  const t = useT()
  const { canOrder } = useAuthGate()
  const firstName = userName.trim().split(/\s+/)[0] || userName

  const navItems = mainNav.filter((item) => {
    if (item.href === "/dashboard") return false
    if (item.permission === "orders" && !canOrder) return false
    return true
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[var(--brand-navy)] outline-none hover:bg-muted/60 data-open:bg-muted/60",
          className
        )}
      >
        <UserRound className="size-[18px] stroke-[1.75]" />
        <span className="max-w-[120px] truncate">{firstName}</span>
        <ChevronDown className="size-4 text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 rounded-xl p-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const href = item.href === "/catalog" ? "/" : item.href
          return (
            <DropdownMenuItem
              key={item.href}
              render={<Link href={href} />}
              className="gap-3 py-2.5"
            >
              <Icon className="size-[18px] stroke-[1.75]" />
              {translateNavTitle(t, item.href, item.title)}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/account" />}
          className="gap-3 py-2.5"
        >
          <UserRound className="size-[18px] stroke-[1.75]" />
          {t("storefront.menuAccount")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/help" />} className="gap-3 py-2.5">
          <CircleHelp className="size-[18px] stroke-[1.75]" />
          {t("storefront.menuHelp")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-3 py-2.5"
          onClick={() => {
            const form = document.getElementById("storefront-logout-form")
            if (form instanceof HTMLFormElement) form.requestSubmit()
          }}
        >
          <LogOut className="size-[18px] stroke-[1.75]" />
          {t("common.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <form id="storefront-logout-form" action={logoutAction} className="hidden" />
    </DropdownMenu>
  )
}
