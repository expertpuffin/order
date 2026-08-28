"use client"

import { useActionState } from "react"

import { saveAcquisitionAction } from "@/lib/actions"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SOURCES = [
  "google_search",
  "social_media",
  "friend_colleague",
  "trade_show",
  "supplier_rep",
  "advertisement",
  "other",
  "prefer_not_to_say",
] as const

export function OnboardingAcquisitionForm() {
  const t = useT()
  const [state, formAction, pending] = useActionState(saveAcquisitionAction, null)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border bg-white p-5">
      {state && "error" in state && state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      <div className="space-y-2">
        {SOURCES.map((source) => (
          <label
            key={source}
            className="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input type="radio" name="source" value={source} required />
            <span className="text-sm">{t(`onboarding.source.${source}`)}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="otherText">{t("onboarding.otherOptional")}</Label>
        <Input id="otherText" name="otherText" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("common.saving") : t("common.continue")}
      </Button>
    </form>
  )
}
