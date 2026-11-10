"use client"

import { useRouter } from "next/navigation"
import { startTransition } from "react"

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
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          Your session may have expired. Try again, or sign in again.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
        <Button onClick={relogin}>Sign in again</Button>
      </div>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          Error {error.digest}
        </p>
      ) : null}
    </div>
  )
}
