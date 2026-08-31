"use client"

import { useActionState, useEffect, useMemo, useState, useTransition } from "react"

import {
  createBusinessAction,
  listTeamRoleNamesAction,
  lookupPostcodeAction,
} from "@/lib/actions"
import { FALLBACK_TEAM_ROLE_NAMES } from "@/lib/team-roles"
import { BUSINESS_TYPES } from "@/lib/types"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AddressHit = {
  line_1?: string
  line_2?: string
  line_3?: string
  post_town?: string
  county?: string
  postcode?: string
  latitude?: number
  longitude?: number
}

const field =
  "h-10 rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
const label =
  "text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
const selectCls =
  "flex h-10 w-full rounded-[2px] border border-[var(--sidebar-border)] bg-background px-3 text-sm text-[var(--brand-navy)] outline-none focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
const primaryBtn =
  "rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
const outlineBtn =
  "rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"

export function BusinessApplyForm() {
  const t = useT()
  const [step, setStep] = useState(0)
  const [state, formAction, pending] = useActionState(createBusinessAction, null)
  const [lookupPending, startLookup] = useTransition()
  const [addresses, setAddresses] = useState<AddressHit[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [postTown, setPostTown] = useState("")
  const [county, setCounty] = useState("")
  const [postcode, setPostcode] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [isOwner, setIsOwner] = useState(true)
  const [roleNames, setRoleNames] = useState<string[]>([
    ...FALLBACK_TEAM_ROLE_NAMES,
  ])
  const [applicantRole, setApplicantRole] = useState("")
  const [contactError, setContactError] = useState<string | null>(null)

  const selectableRoles = useMemo(
    () => roleNames.filter((r) => r !== "Owner"),
    [roleNames]
  )

  useEffect(() => {
    let cancelled = false
    void listTeamRoleNamesAction()
      .then((res) => {
        if (!cancelled && res.names.length) setRoleNames(res.names)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const runLookup = () => {
    setLookupError(null)
    startLookup(async () => {
      const result = await lookupPostcodeAction(postcode)
      if ("error" in result && result.error) {
        setLookupError(
          result.error.includes("402") ||
            result.error.toLowerCase().includes("unavailable") ||
            result.error.toLowerCase().includes("balance")
            ? t("onboarding.business.lookupUnavailable")
            : result.error
        )
        setAddresses(result.addresses ?? [])
        return
      }
      const list = result.addresses ?? []
      setAddresses(list)
      if (!list.length) {
        setLookupError(t("onboarding.business.noAddresses"))
      }
    })
  }

  const applyAddress = (hit: AddressHit) => {
    setLine1(hit.line_1 || "")
    setLine2([hit.line_2, hit.line_3].filter(Boolean).join(", "))
    setPostTown(hit.post_town || "")
    setCounty(hit.county || "")
    if (hit.postcode) setPostcode(hit.postcode)
    setLatitude(hit.latitude != null ? String(hit.latitude) : "")
    setLongitude(hit.longitude != null ? String(hit.longitude) : "")
  }

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-[2px] border border-[var(--sidebar-border)] bg-white p-5"
    >
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-[1px]",
              i <= step ? "bg-[var(--brand-navy)]" : "bg-muted"
            )}
          />
        ))}
      </div>

      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />

      <div className={step === 0 ? "space-y-3" : "hidden"}>
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
          {t("onboarding.business.basics")}
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="tradingName" className={label}>
            {t("onboarding.business.tradingName")}
          </Label>
          <Input id="tradingName" name="tradingName" className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessName" className={label}>
            {t("onboarding.business.legalName")}
          </Label>
          <Input id="businessName" name="businessName" required className={field} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessType" className={label}>
            {t("onboarding.business.type")}
          </Label>
          <select
            id="businessType"
            name="businessType"
            className={selectCls}
            defaultValue=""
            required
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
        <Button
          type="button"
          className={cn("w-full", primaryBtn)}
          onClick={() => setStep(1)}
        >
          {t("common.continue")}
        </Button>
      </div>

      <div className={step === 1 ? "space-y-3" : "hidden"}>
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
          {t("onboarding.business.address")}
        </h2>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="postcode" className={label}>
              {t("onboarding.business.postcode")}
            </Label>
            <Input
              id="postcode"
              name="postcode"
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              className={field}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className={cn("mt-[22px] shrink-0", outlineBtn)}
            disabled={lookupPending || !postcode.trim()}
            onClick={runLookup}
          >
            {lookupPending
              ? t("onboarding.business.lookingUp")
              : t("onboarding.business.lookupPostcode")}
          </Button>
        </div>
        {lookupError ? (
          <p className="text-xs text-destructive">{lookupError}</p>
        ) : null}
        {addresses.length > 0 ? (
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-[2px] border border-[var(--sidebar-border)] p-1">
            <p className={cn(label, "px-2 pt-1")}>
              {t("onboarding.business.pickAddress")}
            </p>
            {addresses.map((hit, index) => (
              <button
                key={`${hit.line_1}-${index}`}
                type="button"
                className="block w-full rounded-[2px] px-2 py-2 text-left text-xs text-[var(--brand-navy)] hover:bg-muted/60"
                onClick={() => applyAddress(hit)}
              >
                {[hit.line_1, hit.line_2, hit.post_town, hit.postcode]
                  .filter(Boolean)
                  .join(", ")}
              </button>
            ))}
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="line1" className={label}>
            {t("onboarding.business.line1")}
          </Label>
          <Input
            id="line1"
            name="line1"
            required
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="line2" className={label}>
            {t("onboarding.business.line2")}
          </Label>
          <Input
            id="line2"
            name="line2"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            className={field}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="postTown" className={label}>
              {t("onboarding.business.town")}
            </Label>
            <Input
              id="postTown"
              name="postTown"
              value={postTown}
              onChange={(e) => setPostTown(e.target.value)}
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="county" className={label}>
              {t("onboarding.business.county")}
            </Label>
            <Input
              id="county"
              name="county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className={field}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn("flex-1", outlineBtn)}
            onClick={() => setStep(0)}
          >
            {t("common.back")}
          </Button>
          <Button
            type="button"
            className={cn("flex-1", primaryBtn)}
            onClick={() => setStep(2)}
          >
            {t("common.continue")}
          </Button>
        </div>
      </div>

      <div className={step === 2 ? "space-y-3" : "hidden"}>
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
          {t("onboarding.business.contact")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="contactFirstName" className={label}>
              {t("auth.firstName")}
            </Label>
            <Input
              id="contactFirstName"
              name="contactFirstName"
              required
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactLastName" className={label}>
              {t("auth.lastName")}
            </Label>
            <Input id="contactLastName" name="contactLastName" className={field} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPhone" className={label}>
            {t("auth.phone")}
          </Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            required
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mainBusinessEmail" className={label}>
            {t("onboarding.business.mainEmail")}
          </Label>
          <Input
            id="mainBusinessEmail"
            name="mainBusinessEmail"
            type="email"
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mainBusinessPhone" className={label}>
            {t("onboarding.business.mainPhone")}
          </Label>
          <Input
            id="mainBusinessPhone"
            name="mainBusinessPhone"
            type="tel"
            className={field}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--brand-navy)]">
          <input
            type="checkbox"
            name="isOwner"
            checked={isOwner}
            onChange={(e) => setIsOwner(e.target.checked)}
            className="size-3.5 rounded-[2px] accent-[var(--brand-navy)]"
          />
          {t("onboarding.business.iAmOwner")}
        </label>

        {!isOwner ? (
          <div className="space-y-3 border-t border-[var(--sidebar-border)] pt-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("onboarding.business.ownerDetails")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="ownerFirstName" className={label}>
                  {t("auth.firstName")} *
                </Label>
                <Input
                  id="ownerFirstName"
                  name="ownerFirstName"
                  required={!isOwner}
                  className={field}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ownerLastName" className={label}>
                  {t("auth.lastName")}
                </Label>
                <Input
                  id="ownerLastName"
                  name="ownerLastName"
                  className={field}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerEmail" className={label}>
                {t("common.email")} *
              </Label>
              <Input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                required={!isOwner}
                className={field}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerPhone" className={label}>
                {t("auth.phone")}
              </Label>
              <Input
                id="ownerPhone"
                name="ownerPhone"
                type="tel"
                className={field}
              />
            </div>
            <div className="space-y-2">
              <p className={label}>{t("onboarding.business.yourRole")} *</p>
              <input type="hidden" name="applicantRole" value={applicantRole} />
              <div className="flex flex-wrap gap-1.5">
                {selectableRoles.map((role) => {
                  const selected = applicantRole === role
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setApplicantRole(role)
                        setContactError(null)
                      }}
                      className={cn(
                        "rounded-[2px] border px-2.5 py-1.5 text-xs font-medium transition-colors",
                        selected
                          ? "border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white"
                          : "border-[var(--sidebar-border)] bg-background text-[var(--brand-navy)] hover:bg-muted/60"
                      )}
                    >
                      {role}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {contactError ? (
          <p className="text-xs text-destructive">{contactError}</p>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn("flex-1", outlineBtn)}
            onClick={() => setStep(1)}
          >
            {t("common.back")}
          </Button>
          <Button
            type="button"
            className={cn("flex-1", primaryBtn)}
            onClick={() => {
              if (!isOwner && !applicantRole.trim()) {
                setContactError(t("onboarding.business.roleRequired"))
                return
              }
              setContactError(null)
              setStep(3)
            }}
          >
            {t("common.continue")}
          </Button>
        </div>
      </div>

      <div className={step === 3 ? "space-y-3" : "hidden"}>
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
          {t("onboarding.business.hours")}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="openTime" className={label}>
              {t("onboarding.business.openTime")}
            </Label>
            <Input
              id="openTime"
              name="openTime"
              defaultValue="09:00"
              className={field}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="closeTime" className={label}>
              {t("onboarding.business.closeTime")}
            </Label>
            <Input
              id="closeTime"
              name="closeTime"
              defaultValue="22:00"
              className={field}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deliveryTime" className={label}>
            {t("onboarding.business.deliveryTime")}
          </Label>
          <select
            id="deliveryTime"
            name="deliveryTime"
            className={selectCls}
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
          <Button
            type="button"
            variant="outline"
            className={cn("flex-1", outlineBtn)}
            onClick={() => setStep(2)}
          >
            {t("common.back")}
          </Button>
          <Button
            type="submit"
            className={cn("flex-1", primaryBtn)}
            disabled={pending}
          >
            {pending ? t("common.saving") : t("onboarding.business.submit")}
          </Button>
        </div>
      </div>
    </form>
  )
}
