"use client"

import { useRouter } from "next/navigation"
import { startTransition } from "react"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { authGateHref } from "@/lib/auth-gate-url"

/**
 * Account area error boundary — replaces Next's bare "This page couldn't
 * load" screen. Most failures here are a session that died mid-request, so
 * offer a retry and the sign-in modal.
 */
export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const t = useT()

  const retry = () => {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }

  const relogin = () => {
    router.push(authGateHref({ tab: "login", next: window.location.pathname }))
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("errors.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("errors.sessionHint")}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={retry}>
          {t("errors.retry")}
        </Button>
        <Button onClick={relogin}>{t("errors.signInAgain")}</Button>
      </div>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          {t("errors.reference", { digest: error.digest })}
        </p>
      ) : null}
    </div>
  )
}
