"use client"

import { useActionState, useTransition } from "react"

import { resendVerificationAction, verifyEmailAction } from "@/lib/actions/onboarding"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/brand/form-error"

export function OnboardingVerifyForm({ email }: { email: string }) {
  const t = useT()
  const [state, formAction, pending] = useActionState(verifyEmailAction, null)
  const [resendPending, startResend] = useTransition()

  return (
    <div className="space-y-4 rounded-[2px] border border-[var(--border-subtle)] bg-white p-5">
      <p className="text-sm text-muted-foreground">
        {t("onboarding.codeSentTo")}{" "}
        <strong className="text-[var(--brand-navy)]">{email}</strong>
      </p>
      <form action={formAction} className="space-y-3.5">
        <input type="hidden" name="email" value={email} />
        {state && "error" in state && state.error ? (
          <FormError compact>
            {state.error}
          </FormError>
        ) : null}
        <div className="space-y-1.5">
          <Label
            htmlFor="code"
            className="field-label"
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
            className="h-12 rounded-[2px] border-[var(--border-subtle)] text-center text-lg tracking-[0.4em] text-[var(--brand-navy)] field-focus"
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full rounded-[2px] btn-navy"
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
