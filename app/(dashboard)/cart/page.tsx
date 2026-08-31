import Link from "next/link"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
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
  const checkoutSupplierId = checkoutGroups[0]?.supplierId ?? null

  return (
    <div className="space-y-5">
      <AccountPageHeader
        data-tour="page-cart-header"
        eyebrow={t("cart.sectionLabel")}
        title={t("nav.cart")}
        description={t("cart.description")}
        actions={
          <Button
            variant="outline"
            className="h-9 rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"
            nativeButton={false}
            render={<Link href="/" />}
          >
            {t("cart.continueShopping")}
          </Button>
        }
      />

      {lines.length === 0 ? (
        <EmptyState
          icon={PUFFIN_ICONS.emptyCart}
          eyebrow={t("cart.sectionLabel")}
          title={t("cart.emptyTitle")}
          body={t("cart.emptyBody")}
          actions={
            <>
              <Button
                className="h-10 rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
                nativeButton={false}
                render={<Link href="/" />}
              >
                {t("nav.catalog")}
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"
                nativeButton={false}
                render={<Link href="/favourites" />}
              >
                {t("nav.favourites")}
              </Button>
            </>
          }
        />
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          {checkoutError ? (
            <p className="rounded-[2px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive xl:col-span-2">
              {checkoutError}
            </p>
          ) : null}
          <div
            data-tour="page-cart-lines"
            className="h-auto self-start overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-white p-4 sm:p-5"
          >
            <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[var(--sidebar-border)] pb-2">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {t("cart.sectionLabel")}
                </p>
                <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
                  {t("cart.itemsTitle")}
                </h2>
              </div>
              <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("cart.lineCount", { count: String(lines.length) })}
              </span>
            </div>
            <CartEditor businessId={ctx.active.id} lines={lines} />
          </div>

          <div
            data-tour="page-cart-checkout"
            className="rounded-[2px] border border-[var(--sidebar-border)] bg-white p-4 sm:p-5 xl:sticky xl:top-20 xl:self-start"
          >
            <div className="mb-4 border-b border-[var(--sidebar-border)] pb-2">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {t("cart.checkoutLabel")}
              </p>
              <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
                {t("cart.checkoutTitle")}
              </h2>
            </div>
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
