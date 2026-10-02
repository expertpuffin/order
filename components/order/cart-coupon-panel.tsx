"use client"

import { useState, useTransition } from "react"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { applyCartCouponAction } from "@/lib/actions"
import type { CartPricing } from "@/lib/api/cart"
import { deliveryFeeLabel } from "@/lib/delivery-fee"
import { toast } from "sonner"

type CouponPanelProps = {
  businessId: string
  initialCode?: string | null
  pricing?: CartPricing | null
}

export function CartCouponPanel({
  businessId,
  initialCode,
  pricing,
}: CouponPanelProps) {
  const t = useT()
  const [code, setCode] = useState(initialCode ?? "")
  const [pending, startTransition] = useTransition()

  const apply = (remove = false) => {
    startTransition(async () => {
      const result = await applyCartCouponAction(businessId, remove ? { remove: true } : { code })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      if (result?.couponError) {
        toast.error(t("promotions.couponInvalid"))
      } else if (!remove && code) {
        toast.success(t("promotions.couponApplied"))
      }
    })
  }

  return (
    <div className="space-y-2 border-t border-[var(--sidebar-border)] pt-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {t("promotions.coupon")}
      </p>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("promotions.couponPlaceholder")}
          className="h-9 rounded-[2px] font-mono uppercase"
        />
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-[2px] btn-brand shrink-0 text-white"
          disabled={pending || !code.trim()}
          onClick={() => apply(false)}
        >
          {t("promotions.apply")}
        </Button>
      </div>
      {initialCode ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => {
            setCode("")
            apply(true)
          }}
        >
          {t("promotions.removeCoupon")}
        </button>
      ) : null}
      {pricing && pricing.totalDiscount > 0 ? (
        <dl className="space-y-1 text-sm">
          {pricing.skuDealDiscount > 0 ? (
            <div className="flex justify-between text-muted-foreground">
              <dt>{t("promotions.dealDiscount")}</dt>
              <dd>-£{pricing.skuDealDiscount.toFixed(2)}</dd>
            </div>
          ) : null}
          {pricing.campaignDiscount > 0 ? (
            <div className="flex justify-between text-muted-foreground">
              <dt>{t("promotions.campaignDiscount")}</dt>
              <dd>-£{pricing.campaignDiscount.toFixed(2)}</dd>
            </div>
          ) : null}
          {pricing.couponDiscount > 0 ? (
            <div className="flex justify-between text-muted-foreground">
              <dt>{t("promotions.couponDiscount")}</dt>
              <dd>-£{pricing.couponDiscount.toFixed(2)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {pricing?.delivery && pricing.delivery.fee.standardAmount > 0 ? (
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>{deliveryFeeLabel(pricing.delivery.fee, t)}</dt>
            <dd>
              {pricing.delivery.fee.waived
                ? t("storefront.free")
                : `£${pricing.delivery.fee.amount.toFixed(2)}`}
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}
