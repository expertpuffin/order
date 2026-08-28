import { getMyBusinesses } from "@/lib/api/businesses"

export async function getMyBusinessesSafe() {
  try {
    return await getMyBusinesses()
  } catch {
    return []
  }
}

export { fetchMeExtended } from "@/lib/api/onboarding"
