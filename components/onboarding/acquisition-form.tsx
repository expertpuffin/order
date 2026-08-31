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
    <form
      action={formAction}
      className="space-y-4 rounded-[2px] border border-[var(--sidebar-border)] bg-white p-5"
    >
      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {SOURCES.map((source) => (
          <label
            key={source}
            className="flex cursor-pointer items-center gap-3 rounded-[2px] border border-[var(--sidebar-border)] px-3 py-2.5 has-[:checked]:border-[var(--brand-navy)] has-[:checked]:bg-[var(--brand-navy)]/5"
          >
            <input
              type="radio"
              name="source"
              value={source}
              required
              className="accent-[var(--brand-navy)]"
            />
            <span className="text-sm text-[var(--brand-navy)]">
              {t(`onboarding.source.${source}`)}
            </span>
          </label>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="otherText"
          className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
        >
          {t("onboarding.otherOptional")}
        </Label>
        <Input
          id="otherText"
          name="otherText"
          className="h-10 rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
        />
      </div>
      <Button
        type="submit"
        className="h-11 w-full rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
        disabled={pending}
      >
        {pending ? t("common.saving") : t("common.continue")}
      </Button>
    </form>
  )
}
