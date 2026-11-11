import { BusinessApplyForm } from "@/components/onboarding/business-apply-form"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { getTranslator } from "@/lib/i18n"
import { requireOnboardingStep } from "@/lib/onboarding-routing"
import { listTeamRoleNames } from "@/lib/api/onboarding"

export default async function BusinessOnboardingPage() {
  await requireOnboardingStep("business")
  const [{ t }, roleNames] = await Promise.all([getTranslator(), listTeamRoleNames()])

  return (
    <OnboardingShell
      title={t("onboarding.business.title")}
      subtitle={t("onboarding.business.subtitle")}
      stepLabel={t("onboarding.stepBusiness")}
    >
      <BusinessApplyForm roleNames={roleNames} />
    </OnboardingShell>
  )
}
