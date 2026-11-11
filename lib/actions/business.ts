"use server"

import { cookies } from "next/headers"

import { refreshAllPages } from "@/lib/actions/result"
import { setActiveBusiness } from "@/lib/business-context"

/** Work in another of the member's businesses; every page re-renders for it. */
export async function switchBusinessAction(businessId: string) {
  setActiveBusiness(await cookies(), businessId)
  refreshAllPages()
}
