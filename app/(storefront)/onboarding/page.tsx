import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/api/auth"
import { fetchMeExtended, getMyBusinessesSafe } from "@/lib/onboarding-routing"
import { OnboardingVerifyForm } from "@/components/onboarding/verify-form"
import { OnboardingAcquisitionForm } from "@/components/onboarding/acquisition-form"

export default async function OnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login?next=/onboarding")

  if (!user.isEmailVerified) {
    return (
      <OnboardingShell title="Verify email">
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
      <OnboardingShell title="How did you hear about us?">
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

function OnboardingShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-[var(--brand-navy)]">{title}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Complete setup to start ordering from Restoloop Market.
      </p>
      {children}
    </div>
  )
}
