import { OnboardingAcquisitionForm } from "@/components/onboarding/acquisition-form"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingVerifyForm } from "@/components/onboarding/verify-form"
import { getTranslator } from "@/lib/i18n"
import { requireOnboardingStep } from "@/lib/onboarding-routing"

export default async function OnboardingPage() {
  const current = await requireOnboardingStep("/onboarding", "verify", "acquisition")
  const { t } = await getTranslator()

  if (current.step === "verify") {
    return (
      <OnboardingShell
        title={t("onboarding.verifyTitle")}
        subtitle={t("onboarding.verifySubtitle")}
        stepLabel={t("onboarding.stepVerify")}
      >
        <OnboardingVerifyForm email={current.email} />
      </OnboardingShell>
    )
  }

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
