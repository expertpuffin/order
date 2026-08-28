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
    <div className="space-y-4 rounded-2xl border bg-white p-5">
      <p className="text-sm text-muted-foreground">
        {t("onboarding.codeSentTo")} <strong>{email}</strong>
      </p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        {state && "error" in state && state.error ? (
          <p className="text-xs text-destructive">{state.error}</p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="code">{t("onboarding.verificationCode")}</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className="h-12 text-center text-lg tracking-[0.4em]"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("onboarding.verifying") : t("onboarding.verify")}
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
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
