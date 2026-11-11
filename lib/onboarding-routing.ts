import { redirect } from "next/navigation"

import { businessDisplayName, getMyBusinesses } from "@/lib/api/businesses"
import { fetchMeExtended } from "@/lib/api/onboarding"
import { authGateHref } from "@/lib/auth-gate-url"
import { isSessionExpired } from "@/lib/business-context"
import { getSessionUser } from "@/lib/session/cookies"

export type OnboardingStep =
  | { step: "verify"; email: string }
  | { step: "acquisition" }
  | { step: "business" }
  | { step: "pending"; businessName: string | null }
  | { step: "done" }

const PATHS: Record<OnboardingStep["step"], string> = {
  verify: "/onboarding",
  acquisition: "/onboarding",
  business: "/onboarding/business",
  pending: "/onboarding/pending",
  done: "/",
}

/**
 * Where a signed-in user stands in onboarding, in order: verify the email, say how
 * they found us, apply with a business, wait for approval. API failures surface as
 * errors — an outage must not look like "no business yet".
 */
async function resolveOnboardingStep(next: string): Promise<OnboardingStep> {
  const user = await getSessionUser()
  const signIn = authGateHref({ tab: "login", next })
  if (!user) redirect(signIn)
  // The user cookie alone isn't enough: a session the backend rejected signs in again
  if (await isSessionExpired().catch(() => false)) redirect(signIn)

  if (!user.isEmailVerified) return { step: "verify", email: user.email }
  if (!(await fetchMeExtended()).acquisitionAnsweredAt) return { step: "acquisition" }

  const businesses = await getMyBusinesses()
  if (businesses.some((b) => b.status === "approved")) return { step: "done" }
  const pending = businesses.find((b) => b.status === "pending")
  if (pending) return { step: "pending", businessName: businessDisplayName(pending) }
  if (businesses.length === 0) return { step: "business" }
  return { step: "done" }
}

/** For the page at `path`: its step, or a redirect to the page the user belongs on. */
export async function requireOnboardingStep<S extends OnboardingStep["step"]>(
  path: string,
  ...steps: S[]
): Promise<Extract<OnboardingStep, { step: S }>> {
  const current = await resolveOnboardingStep(path)
  if (!(steps as string[]).includes(current.step)) redirect(PATHS[current.step])
  return current as Extract<OnboardingStep, { step: S }>
}
