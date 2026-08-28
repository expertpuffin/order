import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { CartEditor } from "@/components/order/cart-editor"
import { CheckoutForm } from "@/components/order/checkout-form"
import { Button } from "@/components/ui/button"
import { getCart } from "@/lib/api/cart"
import { getBusinessContext } from "@/lib/business-context"
import { getTranslator } from "@/lib/i18n"
import { hasTeamPermission } from "@/lib/permissions"

export default async function CartPage() {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx) return <AccessDenied />
  if (!hasTeamPermission(ctx.active.permissions, "orders")) {
    return <AccessDenied />
  }

  const { lines, checkoutGroups, checkoutError } = await getCart(ctx.active.id)
  const checkoutSupplierId =
    checkoutGroups[0]?.supplierId ?? null

  return (
    <div className="space-y-5">
      <AccountPageHeader
        title={t("nav.cart")}
        description={t("cart.description")}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
          >
            {t("cart.continueShopping")}
          </Button>
        }
      />

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white px-6 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/60">
            <ShoppingCart className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-[var(--brand-navy)]">
              {t("cart.emptyTitle")}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("cart.emptyBody")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button nativeButton={false} render={<Link href="/" />}>
              {t("nav.catalog")}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/favourites" />}
            >
              {t("nav.favourites")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          {checkoutError ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive xl:col-span-2">
              {checkoutError}
            </p>
          ) : null}
          <div
            data-tour="page-cart-lines"
            className="h-auto self-start overflow-hidden rounded-2xl border bg-white p-4 sm:p-6"
          >
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                {t("cart.itemsTitle")}
              </h2>
              <span className="text-sm text-muted-foreground">
                {t("cart.lineCount", { count: String(lines.length) })}
              </span>
            </div>
            <CartEditor businessId={ctx.active.id} lines={lines} />
          </div>

          <div
            data-tour="page-cart-checkout"
            className="rounded-2xl border bg-white p-4 sm:p-5 xl:sticky xl:top-20 xl:self-start"
          >
            <h2 className="mb-5 text-lg font-bold text-[var(--brand-navy)]">
              {t("cart.checkoutTitle")}
            </h2>
            <CheckoutForm
              businessId={ctx.active.id}
              supplierId={checkoutSupplierId}
              defaultDeliveryTime={ctx.active.deliveryTime}
              openTime={ctx.active.openTime}
              closeTime={ctx.active.closeTime}
              lineCount={lines.length}
              businessName={ctx.active.tradingName || ctx.active.businessName}
              businessPostcode={ctx.active.postcode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
