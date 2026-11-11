"use client"

import { useActionState } from "react"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction, registerAction } from "@/lib/actions/auth"

const gateField =
  "h-10 rounded-[2px] border-[var(--border-subtle)] text-[var(--brand-navy)] focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
const gateLabel =
  "text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
const gateSubmit =
  "h-11 w-full rounded-[2px] btn-brand font-semibold text-white"

export function LoginForm({ next }: { next: string }) {
  const t = useT()
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="hidden" name="next" value={next} />
      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="gate-email" className={gateLabel}>
          {t("common.email")}
        </Label>
        <Input
          id="gate-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={gateField}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="gate-password" className={gateLabel}>
          {t("common.password")}
        </Label>
        <Input
          id="gate-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={gateField}
        />
      </div>
      <Button type="submit" className={gateSubmit} disabled={pending}>
        {pending ? t("auth.signingIn") : t("auth.signIn")}
      </Button>
    </form>
  )
}

export function RegisterForm() {
  const t = useT()
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="space-y-3.5">
      {state && "error" in state && state.error ? (
        <p className="rounded-[2px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className={gateLabel}>
            {t("auth.firstName")}
          </Label>
          <Input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className={gateField}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className={gateLabel}>
            {t("auth.lastName")}
          </Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            className={gateField}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-email" className={gateLabel}>
          {t("common.email")}
        </Label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={gateField}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone" className={gateLabel}>
          {t("auth.phone")}
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="+44…"
          autoComplete="tel"
          className={gateField}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className={gateLabel}>
          {t("common.password")}
        </Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={gateField}
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          name="receiveAnnouncements"
          value="off"
          className="mt-0.5 size-3.5 rounded-[2px] border-[var(--border-subtle)] accent-[var(--brand-navy)]"
        />
        {t("auth.optOutAnnouncements")}
      </label>
      <Button type="submit" className={gateSubmit} disabled={pending}>
        {pending ? t("auth.signingUp") : t("auth.signUp")}
      </Button>
    </form>
  )
}
