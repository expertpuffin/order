"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Menu, Search, ShoppingBag } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { useAuthGate } from "@/components/storefront/auth-gate"
import {
  DeliveryBusinessPicker,
  type DeliveryBusinessOption,
} from "@/components/storefront/delivery-business-picker"
import { StorefrontLocaleMenu } from "@/components/storefront/storefront-locale-menu"
import { StorefrontUserMenu } from "@/components/storefront/storefront-user-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type StorefrontTopBarProps = {
  businesses?: DeliveryBusinessOption[]
  activeBusinessId?: string | null
  userName?: string | null
  q?: string
  cartCount?: number
  cartHref?: string
  onOpenCategories?: () => void
  onOpenCart?: () => void
}

const railCell =
  "inline-flex h-9 items-center justify-center text-[var(--brand-navy)] transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset"

export function StorefrontTopBar({
  businesses = [],
  activeBusinessId = null,
  userName,
  q,
  cartCount = 0,
  cartHref = "/cart",
  onOpenCategories,
  onOpenCart,
}: StorefrontTopBarProps) {
  const t = useT()
  const { isAuthenticated, openAuthGate } = useAuthGate()

  const cartBadge =
    cartCount > 0 ? (
      <span className="flex items-center justify-center rounded-[2px] bg-[var(--brand-orange)] px-1.5 py-0.5 text-[10px] font-bold text-white">
        {cartCount > 9 ? "9+" : cartCount}
      </span>
    ) : null

  const cartControl = onOpenCart ? (
    <button
      type="button"
      onClick={onOpenCart}
      className={cn(railCell, "relative gap-2 bg-muted/20 px-3")}
      aria-label={t("nav.cart")}
    >
      <ShoppingBag className="size-[18px] stroke-[1.75]" />
      {cartBadge}
    </button>
  ) : (
    <Link
      href={cartHref}
      className={cn(railCell, "relative gap-2 bg-muted/20 px-3")}
      aria-label={t("nav.cart")}
    >
      <ShoppingBag className="size-[18px] stroke-[1.75]" />
      {cartBadge}
    </Link>
  )

  const deliveryPicker = (
    <DeliveryBusinessPicker
      businesses={businesses}
      activeBusinessId={activeBusinessId}
      isAuthenticated={isAuthenticated}
      onRequireAuth={() => openAuthGate({ intent: "address", tab: "login" })}
      className="w-full lg:max-w-[280px]"
      variant="ledger"
    />
  )

  const searchField = (compact?: boolean) => (
    <div
      className={cn(
        "relative flex w-full items-center rounded-[2px] border border-[var(--sidebar-border)] bg-background",
        compact ? "h-10" : "h-10"
      )}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name="q"
        defaultValue={q}
        placeholder={t("storefront.searchProducts")}
        className="h-full w-full min-w-0 rounded-none border-0 bg-transparent pl-9 shadow-none focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
      />
    </div>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--sidebar-border)] bg-background">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-[2px] border border-[var(--sidebar-border)] lg:hidden"
          onClick={onOpenCategories}
          aria-label={t("storefront.categories")}
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2 pr-2">
          <Image
            src="/icon.png"
            alt="Orderia Business"
            width={36}
            height={36}
            className="size-9 object-contain"
            priority
          />
          <span className="hidden text-lg font-bold tracking-tight text-[var(--brand-navy)] sm:inline">
            Orderia Business
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:flex lg:max-w-[280px]">
          {deliveryPicker}
        </div>

        <form action="/" className="hidden min-w-0 flex-[1.4] md:block">
          {searchField()}
        </form>

        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated && userName ? (
            <div className="hidden border-r border-[var(--sidebar-border)] pr-4 sm:block">
              <StorefrontUserMenu userName={userName} />
            </div>
          ) : (
            <div className="hidden items-center gap-4 border-r border-[var(--sidebar-border)] pr-4 sm:flex">
              <button
                type="button"
                className="text-sm font-medium text-[var(--brand-navy)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                onClick={() => openAuthGate({ tab: "login" })}
              >
                {t("auth.signIn")}
              </button>
              <Button
                size="sm"
                className="h-9 rounded-[2px] btn-brand px-4 text-white"
                onClick={() => openAuthGate({ tab: "register" })}
              >
                {t("auth.signUp")}
              </Button>
            </div>
          )}

          <div className="flex items-center divide-x divide-[var(--sidebar-border)] overflow-hidden rounded-[2px] border border-[var(--sidebar-border)]">
            <StorefrontLocaleMenu variant="rail" />

            <Link
              href={isAuthenticated ? "/favourites" : "#"}
              onClick={(event) => {
                if (!isAuthenticated) {
                  event.preventDefault()
                  openAuthGate({ intent: "favourite", tab: "login" })
                }
              }}
              className={cn(railCell, "w-10")}
              aria-label={t("nav.favourites")}
            >
              <Heart className="size-[18px] stroke-[1.75]" />
            </Link>

            {cartControl}
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-[var(--sidebar-border)] px-3 py-2 md:hidden">
        {deliveryPicker}
        <form action="/">{searchField(true)}</form>
      </div>
    </header>
  )
}
