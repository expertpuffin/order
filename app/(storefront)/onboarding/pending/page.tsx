import { redirect } from "next/navigation"
import Link from "next/link"

import { getSessionUser } from "@/lib/api/auth"
import { authGateHref } from "@/lib/auth-gate-url"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { getMyBusinessesSafe } from "@/lib/onboarding-routing"
import { getTranslator } from "@/lib/i18n"

export default async function PendingOnboardingPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect(authGateHref({ tab: "login", next: "/onboarding/pending" }))
  }

  const businesses = await getMyBusinessesSafe()
  const pending = businesses.find((b) => b.status === "pending")
  const approved = businesses.find((b) => b.status === "approved")
  if (approved) redirect("/")
  if (!pending && businesses.length === 0) redirect("/onboarding/business")

  const { t } = await getTranslator()
  const name =
    pending?.tradingName || pending?.businessName || t("common.restoloop")

  return (
    <OnboardingShell
      title={t("storefront.pendingTitle")}
      subtitle={t("storefront.pendingBody")}
      stepLabel={t("status.pending")}
      footer={null}
    >
      <div className="rounded-[2px] border border-[var(--sidebar-border)] bg-white p-6 text-center">
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("status.pending")}
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">
          {name}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[2px] bg-[var(--brand-navy)] text-sm font-semibold text-white hover:bg-[var(--brand-navy)]/90"
        >
          {t("storefront.keepBrowsing")}
        </Link>
      </div>
    </OnboardingShell>
  )
}
