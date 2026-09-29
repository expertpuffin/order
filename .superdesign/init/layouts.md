# Layouts — Orderia Business Order storefront

## StorefrontTopBar — `components/storefront/storefront-top-bar.tsx`
Sticky storefront header: logo, delivery address picker, product search, auth/user, locale, favourites, cart. Desktop single row; mobile stacks delivery + search under the bar.

```tsx
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

  const cartControl = onOpenCart ? (
    <button
      type="button"
      onClick={onOpenCart}
      className="relative inline-flex size-10 items-center justify-center rounded-full bg-muted/50 text-[var(--brand-navy)] hover:bg-muted"
      aria-label={t("nav.cart")}
    >
      <ShoppingBag className="size-[18px] stroke-[1.75]" />
      {cartCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      ) : null}
    </button>
  ) : (
    <Link
      href={cartHref}
      className="relative inline-flex size-10 items-center justify-center rounded-full bg-muted/50 text-[var(--brand-navy)] hover:bg-muted"
      aria-label={t("nav.cart")}
    >
      <ShoppingBag className="size-[18px] stroke-[1.75]" />
      {cartCount > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      ) : null}
    </Link>
  )

  const deliveryPicker = (
    <DeliveryBusinessPicker
      businesses={businesses}
      activeBusinessId={activeBusinessId}
      isAuthenticated={isAuthenticated}
      onRequireAuth={() => openAuthGate({ intent: "address", tab: "login" })}
      className="w-full lg:max-w-xs"
    />
  )

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl border lg:hidden"
          onClick={onOpenCategories}
          aria-label={t("storefront.categories")}
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
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

        <div className="hidden min-w-0 flex-1 md:flex">{deliveryPicker}</div>

        <form action="/" className="hidden min-w-0 flex-[1.4] md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder={t("storefront.searchProducts")}
              className="h-11 rounded-full border-muted-foreground/20 bg-muted/40 pl-10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {isAuthenticated && userName ? (
            <StorefrontUserMenu userName={userName} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-[var(--brand-navy)]"
                onClick={() => openAuthGate({ tab: "login" })}
              >
                {t("auth.signIn")}
              </Button>
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => openAuthGate({ tab: "register" })}
              >
                {t("auth.signUp")}
              </Button>
            </div>
          )}

          <StorefrontLocaleMenu />

          <Link
            href={isAuthenticated ? "/favourites" : "#"}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-lg text-[var(--brand-navy)] hover:bg-muted/60",
              !isAuthenticated && "opacity-90"
            )}
            aria-label={t("nav.favourites")}
          >
            <Heart className="size-[18px] stroke-[1.75]" />
          </Link>

          {cartControl}
        </div>
      </div>

      <div className="space-y-2 border-t px-3 py-2 md:hidden">
        {deliveryPicker}
        <form action="/">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder={t("storefront.searchProducts")}
              className="h-10 rounded-full bg-muted/40 pl-10"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
```

## DeliveryBusinessPicker — `components/storefront/delivery-business-picker.tsx`
Bordered address chip: MapPin icon, “Delivery to” label, business name · postcode, chevron. Used inside the header.
