import { redirect } from "next/navigation"
import Link from "next/link"

import { getSessionUser } from "@/lib/api/auth"
import { BusinessApplyForm } from "@/components/onboarding/business-apply-form"
import { getMyBusinessesSafe } from "@/lib/onboarding-routing"
import { getTranslator } from "@/lib/i18n"

export default async function BusinessOnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/onboarding/business")
  if (!user.isEmailVerified) redirect("/onboarding")

  const businesses = await getMyBusinessesSafe()
  if (businesses.length > 0) {
    const pending = businesses.find((b) => b.status === "pending")
    if (pending) redirect("/onboarding/pending")
    redirect("/account")
  }

  const { t } = await getTranslator()

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-[var(--brand-navy)]">
        {t("onboarding.business.title")}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("onboarding.business.subtitle")}
      </p>
      <BusinessApplyForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/" className="text-primary underline">
          {t("storefront.keepBrowsing")}
        </Link>
      </p>
    </div>
  )
}
