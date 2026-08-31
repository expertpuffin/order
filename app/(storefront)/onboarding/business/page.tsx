import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/api/auth"
import { authGateHref } from "@/lib/auth-gate-url"
import { BusinessApplyForm } from "@/components/onboarding/business-apply-form"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { getMyBusinessesSafe } from "@/lib/onboarding-routing"
import { getTranslator } from "@/lib/i18n"

export default async function BusinessOnboardingPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect(authGateHref({ tab: "login", next: "/onboarding/business" }))
  }
  if (!user.isEmailVerified) redirect("/onboarding")

  const businesses = await getMyBusinessesSafe()
  if (businesses.length > 0) {
    const pending = businesses.find((b) => b.status === "pending")
    if (pending) redirect("/onboarding/pending")
    redirect("/")
  }

  const { t } = await getTranslator()

  return (
    <OnboardingShell
      title={t("onboarding.business.title")}
      subtitle={t("onboarding.business.subtitle")}
      stepLabel={t("onboarding.stepBusiness")}
    >
      <BusinessApplyForm />
    </OnboardingShell>
  )
}
