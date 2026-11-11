"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import { LoginForm, RegisterForm } from "@/components/auth/auth-forms"
import { PuffinIcon, PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { AuthTab } from "@/lib/auth-gate-url"

/**
 * Sign in / sign up. A signed-in user whose business is still under review sees
 * where their application stands instead.
 */
export function AuthDialog({
  open,
  onOpenChange,
  tab,
  onTabChange,
  next,
  awaitingApproval,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tab: AuthTab
  onTabChange: (tab: AuthTab) => void
  /** Where to go after signing in */
  next: string
  awaitingApproval: boolean
}) {
  const t = useT()
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] p-0 ring-0 sm:max-w-md">
        <DialogHeader className="space-y-1 border-b border-[var(--sidebar-border)] px-5 py-4 text-left">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image src="/icon.png" alt="" width={24} height={24} className="size-6 object-contain" />
              <span className="text-sm font-semibold tracking-tight text-[var(--brand-navy)]">{t("common.ordoria")}</span>
            </div>
            <PuffinIcon name={PUFFIN_ICONS.welcome} className="size-12 shrink-0 text-[var(--brand-navy)]" />
          </div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {t("auth.accountLabel")}
          </p>
          <DialogTitle className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
            {awaitingApproval ? t("storefront.pendingTitle") : tab === "login" ? t("auth.signIn") : t("auth.signUp")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {awaitingApproval ? t("storefront.pendingBody") : t("storefront.authGateHint")}
          </DialogDescription>
        </DialogHeader>

        {awaitingApproval ? (
          <div className="space-y-2 p-5">
            <Button
              className="h-11 w-full rounded-[2px] btn-brand font-semibold text-white"
              onClick={() => router.push("/onboarding/pending")}
            >
              {t("storefront.viewApplication")}
            </Button>
            <Button
              variant="outline"
              className="h-10 w-full rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"
              onClick={() => onOpenChange(false)}
            >
              {t("storefront.keepBrowsing")}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 border-b border-[var(--sidebar-border)] bg-muted/20">
              {(["login", "register"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    tab === value
                      ? "bg-[var(--brand-navy)] py-2.5 text-sm font-medium text-white"
                      : "py-2.5 text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/60"
                  }
                  onClick={() => onTabChange(value)}
                >
                  {value === "login" ? t("auth.signIn") : t("auth.signUp")}
                </button>
              ))}
            </div>
            <div className="p-5">{tab === "login" ? <LoginForm next={next} /> : <RegisterForm />}</div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
