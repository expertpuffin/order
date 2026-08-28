"use client"

import { useActionState, useState } from "react"

import { createBusinessAction } from "@/lib/actions"
import { BUSINESS_TYPES } from "@/lib/types"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BusinessApplyForm() {
  const t = useT()
  const [step, setStep] = useState(0)
  const [state, formAction, pending] = useActionState(createBusinessAction, null)

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border bg-white p-5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {state && "error" in state && state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}

      <div className={step === 0 ? "space-y-3" : "hidden"}>
        <h2 className="font-semibold text-[var(--brand-navy)]">
          {t("onboarding.business.basics")}
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="tradingName">{t("onboarding.business.tradingName")}</Label>
          <Input id="tradingName" name="tradingName" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessName">{t("onboarding.business.legalName")}</Label>
          <Input id="businessName" name="businessName" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessType">{t("onboarding.business.type")}</Label>
          <select
            id="businessType"
            name="businessType"
            className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              {t("onboarding.business.selectType")}
            </option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" className="w-full" onClick={() => setStep(1)}>
          {t("common.continue")}
        </Button>
      </div>

      <div className={step === 1 ? "space-y-3" : "hidden"}>
        <h2 className="font-semibold text-[var(--brand-navy)]">
          {t("onboarding.business.address")}
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="postcode">{t("onboarding.business.postcode")}</Label>
          <Input id="postcode" name="postcode" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="line1">{t("onboarding.business.line1")}</Label>
          <Input id="line1" name="line1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="line2">{t("onboarding.business.line2")}</Label>
          <Input id="line2" name="line2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="postTown">{t("onboarding.business.town")}</Label>
            <Input id="postTown" name="postTown" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="county">{t("onboarding.business.county")}</Label>
            <Input id="county" name="county" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
            {t("common.back")}
          </Button>
          <Button type="button" className="flex-1" onClick={() => setStep(2)}>
            {t("common.continue")}
          </Button>
        </div>
      </div>

      <div className={step === 2 ? "space-y-3" : "hidden"}>
        <h2 className="font-semibold text-[var(--brand-navy)]">
          {t("onboarding.business.contact")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactFirstName">{t("auth.firstName")}</Label>
            <Input id="contactFirstName" name="contactFirstName" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactLastName">{t("auth.lastName")}</Label>
            <Input id="contactLastName" name="contactLastName" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPhone">{t("auth.phone")}</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
            {t("common.back")}
          </Button>
          <Button type="button" className="flex-1" onClick={() => setStep(3)}>
            {t("common.continue")}
          </Button>
        </div>
      </div>

      <div className={step === 3 ? "space-y-3" : "hidden"}>
        <h2 className="font-semibold text-[var(--brand-navy)]">
          {t("onboarding.business.hours")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="openTime">{t("onboarding.business.openTime")}</Label>
            <Input id="openTime" name="openTime" defaultValue="09:00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="closeTime">{t("onboarding.business.closeTime")}</Label>
            <Input id="closeTime" name="closeTime" defaultValue="22:00" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deliveryTime">{t("onboarding.business.deliveryTime")}</Label>
          <select
            id="deliveryTime"
            name="deliveryTime"
            className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
            defaultValue="11:00-13:00"
          >
            {["07:00-09:00", "09:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00"].map(
              (slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              )
            )}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
            {t("common.back")}
          </Button>
          <Button type="submit" className="flex-1" disabled={pending}>
            {pending ? t("common.saving") : t("onboarding.business.submit")}
          </Button>
        </div>
      </div>
    </form>
  )
}
