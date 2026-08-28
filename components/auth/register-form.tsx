"use client"

import Image from "next/image"
import Link from "next/link"
import { useActionState } from "react"

import { registerAction } from "@/lib/actions"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { useT } from "@/components/i18n/i18n-provider"
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

export function RegisterPageForm() {
  const t = useT()
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-4">
      <div className="absolute right-4 top-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="relative mb-8 text-center">
        <Image
          src="/icon.png"
          alt="Restoloop"
          width={64}
          height={64}
          className="mx-auto mb-4 size-16 object-contain"
          priority
        />
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-navy)]">
          {t("common.restoloop")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("auth.signUp")}</p>
      </div>

      <Card className="relative w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.signUp")}</CardTitle>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-3">
            {state && "error" in state && state.error ? (
              <p className="text-xs text-destructive">{state.error}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                <Input id="lastName" name="lastName" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("auth.phone")}</Label>
              <Input id="phone" name="phone" type="tel" required placeholder="+44…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("common.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? t("auth.signingUp") : t("auth.signUp")}
            </Button>
            <Link href="/login" className="text-center text-sm text-primary underline">
              {t("auth.signIn")}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
