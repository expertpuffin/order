import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/api/auth"
import { authGateHref } from "@/lib/auth-gate-url"
import { fetchMeExtended, getMyBusinessesSafe } from "@/lib/onboarding-routing"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingVerifyForm } from "@/components/onboarding/verify-form"
import { OnboardingAcquisitionForm } from "@/components/onboarding/acquisition-form"
import { getTranslator } from "@/lib/i18n"

export default async function OnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect(authGateHref({ tab: "login", next: "/onboarding" }))

  const { t } = await getTranslator()

  if (!user.isEmailVerified) {
    return (
      <OnboardingShell
        title={t("onboarding.verifyTitle")}
        subtitle={t("onboarding.verifySubtitle")}
        stepLabel={t("onboarding.stepVerify")}
      >
        <OnboardingVerifyForm email={user.email} />
      </OnboardingShell>
    )
  }

  let acquisitionAnsweredAt: string | null = null
  try {
    const me = await fetchMeExtended()
    acquisitionAnsweredAt = me.acquisitionAnsweredAt
  } catch {
    /* ignore */
  }

  if (!acquisitionAnsweredAt) {
    return (
      <OnboardingShell
        title={t("onboarding.acquisitionTitle")}
        subtitle={t("onboarding.acquisitionSubtitle")}
        stepLabel={t("onboarding.stepAcquisition")}
      >
        <OnboardingAcquisitionForm />
      </OnboardingShell>
    )
  }

  const businesses = await getMyBusinessesSafe()
  if (!businesses.length) {
    redirect("/onboarding/business")
  }

  const pending = businesses.find((b) => b.status === "pending")
  if (pending) redirect("/onboarding/pending")

  redirect("/")
}
