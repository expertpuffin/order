import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/api/auth"
import { getMyBusinesses } from "@/lib/api/businesses"
import { authGateHref } from "@/lib/auth-gate-url"
import { isSessionExpired } from "@/lib/business-context"

export async function getMyBusinessesSafe() {
  try {
    return await getMyBusinesses()
  } catch {
    return []
  }
}

/**
 * Onboarding pages' auth guard. The rl_user cookie alone isn't enough: when
 * the backend has rejected the session (401), getMyBusinessesSafe() returns []
 * and a signed-in user would be shown the new-business form — send them to
 * the sign-in modal instead.
 */
export async function requireOnboardingUser(next: string) {
  const user = await getSessionUser()
  const gate = authGateHref({ tab: "login", next })
  if (!user) redirect(gate)
  // Non-401 failures (e.g. unverified email) aren't a dead session
  if (await isSessionExpired().catch(() => false)) redirect(gate)
  return user
}

export { fetchMeExtended } from "@/lib/api/onboarding"
