"use client"

import { useActionState, useTransition } from "react"

import {
  resendVerificationAction,
  verifyEmailAction,
} from "@/lib/actions"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function OnboardingVerifyForm({ email }: { email: string }) {
  const t = useT()
  const [state, formAction, pending] = useActionState(verifyEmailAction, null)
  const [resendPending, startResend] = useTransition()

  return (
    <div className="space-y-4 rounded-[2px] border border-[var(--sidebar-border)] bg-white p-5">
      <p className="text-sm text-muted-foreground">
        {t("onboarding.codeSentTo")}{" "}
        <strong className="text-[var(--brand-navy)]">{email}</strong>
      </p>
      <form action={formAction} className="space-y-3.5">
        <input type="hidden" name="email" value={email} />
        {state && "error" in state && state.error ? (
          <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {state.error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <Label
            htmlFor="code"
            className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {t("onboarding.verificationCode")}
          </Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="h-12 rounded-[2px] border-[var(--sidebar-border)] text-center text-lg tracking-[0.4em] text-[var(--brand-navy)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
          disabled={pending}
        >
          {pending ? t("onboarding.verifying") : t("onboarding.verify")}
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        className="w-full rounded-[2px] text-[var(--brand-navy)]"
        disabled={resendPending}
        onClick={() =>
          startResend(async () => {
            await resendVerificationAction()
          })
        }
      >
        {t("onboarding.resendCode")}
      </Button>
    </div>
  )
}
