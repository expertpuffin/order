import Link from "next/link"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/account/account-page-header"
import { CartSummary } from "@/components/cart/cart-summary"
import { CouponField } from "@/components/cart/coupon-field"
import { CartEditor } from "@/components/cart/cart-editor"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { Button } from "@/components/ui/button"
import { getCart } from "@/lib/api/cart"
import { summarizeCart } from "@/lib/cart-summary"
import { businessDisplayName } from "@/lib/api/businesses"
import { checkOrderApproval } from "@/lib/api/orders"
import { canOrderFor, getBusinessContext } from "@/lib/business-context"
import { getTranslator } from "@/lib/i18n"
import { FormError } from "@/components/brand/form-error"

export default async function CartPage() {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx || !canOrderFor(ctx.active)) return <AccessDenied />

  const { lines, checkoutGroups, checkoutError, pricing, couponCode } =
    await getCart(ctx.active.id)
  const checkoutSupplierId = checkoutGroups[0]?.supplierId ?? null
  const summary = summarizeCart(pricing, lines)
  // Will this order wait for a manager? (the backend decides again at checkout)
  const approval = lines.length ? await checkOrderApproval(ctx.active.id, summary.goodsTotal) : null

  return (
    <div className="space-y-5">
      <AccountPageHeader
        eyebrow={t("cart.sectionLabel")}
        title={t("nav.cart")}
        description={t("cart.description")}
        actions={
          <Button
            variant="outline"
            className="h-9 rounded-[2px] border-[var(--border-subtle)] text-[var(--brand-navy)]"
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
                className="h-10 rounded-[2px] btn-navy"
                nativeButton={false}
                render={<Link href="/" />}
              >
                {t("nav.catalog")}
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-[2px] border-[var(--border-subtle)] text-[var(--brand-navy)]"
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
            <FormError className="px-4 py-3 xl:col-span-2">
              {checkoutError}
            </FormError>
          ) : null}
          <div
            className="h-auto self-start overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-white p-4 sm:p-5"
          >
            <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[var(--border-subtle)] pb-2">
              <div>
                <p className="eyebrow">
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
            className="rounded-[2px] border border-[var(--border-subtle)] bg-white p-4 sm:p-5 xl:sticky xl:top-20 xl:self-start"
          >
            <div className="mb-4 border-b border-[var(--border-subtle)] pb-2">
              <p className="eyebrow">
                {t("cart.checkoutLabel")}
              </p>
              <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
                {t("cart.checkoutTitle")}
              </h2>
            </div>
            <CartSummary summary={summary} variant="full" />
            <CouponField businessId={ctx.active.id} initialCode={couponCode} />
            <CheckoutForm
              businessId={ctx.active.id}
              supplierId={checkoutSupplierId}
              defaultDeliveryTime={ctx.active.deliveryTime}
              openTime={ctx.active.openTime}
              closeTime={ctx.active.closeTime}
              lineCount={lines.length}
              businessName={businessDisplayName(ctx.active)}
              businessPostcode={ctx.active.postcode}
              approval={approval?.required ? approval.rule : null}
            />
          </div>
        </div>
      )}
    </div>
  )
}
