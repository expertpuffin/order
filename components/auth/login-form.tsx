"use client"

import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { useT } from "@/components/i18n/i18n-provider"
import Image from "next/image"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"

import { loginAction } from "@/lib/actions"
import { useActionToast } from "@/lib/action-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const t = useT()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"
  const authError = searchParams.get("error")
  const [state, formAction, pending] = useActionState(loginAction, null)
  useActionToast(state, { showSuccess: false })

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute right-4 top-4 z-10">
        <LocaleSwitcher />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 50% -10%, color-mix(in srgb, #F58220 18%, transparent), transparent 60%), linear-gradient(180deg, var(--background), color-mix(in srgb, #002D62 4%, var(--background)))",
        }}
      />
      <div className="relative mb-8 text-center">
        <Image
          src="/icon.png"
          alt="Restoloop"
          width={64}
          height={64}
          className="mx-auto mb-4 size-16 object-contain"
          priority
        />
        <div className="mx-auto mb-3 h-px w-8 bg-foreground/20" aria-hidden />
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-navy)]">{t("common.restoloop")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.portalSubtitle")}</p>
      </div>

      <Card className="relative w-full max-w-sm border-border/60 shadow-[0_24px_60px_-32px_color-mix(in_srgb,#002D62_25%,transparent)]">
        <CardHeader>
          <CardTitle>{t("auth.signIn")}</CardTitle>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="next" value={next} />
          <CardContent className="space-y-4">
            {authError === "no_business" ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                {t("auth.noBusiness")}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
            <a href="/register" className="text-center text-sm text-primary underline">
              {t("auth.signUp")}
            </a>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
