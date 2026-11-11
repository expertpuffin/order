import Link from "next/link"

import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { requireOnboardingStep } from "@/lib/onboarding-routing"
import { getTranslator } from "@/lib/i18n"

export default async function PendingOnboardingPage() {
  const { businessName } = await requireOnboardingStep("pending")
  const { t } = await getTranslator()
  const name = businessName || t("common.ordoria")

  return (
    <OnboardingShell
      title={t("storefront.pendingTitle")}
      subtitle={t("storefront.pendingBody")}
      stepLabel={t("status.pending")}
      footer={null}
    >
      <div className="rounded-[2px] border border-[var(--border-subtle)] bg-white p-6 text-center">
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {t("status.pending")}
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--brand-navy)]">
          {name}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[2px] btn-navy text-sm"
        >
          {t("storefront.keepBrowsing")}
        </Link>
      </div>
    </OnboardingShell>
  )
}
