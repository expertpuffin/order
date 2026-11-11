"use server"

import { redirect } from "next/navigation"

import { actionError, failure, formString } from "@/lib/actions/result"
import { safeNextPath } from "@/lib/safe-redirect"
import { signIn, signOut, signUp } from "@/lib/session/auth"
import { DEFAULT_NEXT } from "@/lib/auth-gate-url"
import { ONBOARDING_PATHS } from "@/lib/storefront-paths"

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = formString(formData, "email")
  const password = formString(formData, "password")
  const next = formString(formData, "next") || DEFAULT_NEXT
  try {
    await signIn(email, password)
  } catch (error) {
    return actionError(error)
  }
  redirect(safeNextPath(next, "/"))
}

export async function logoutAction() {
  await signOut()
  redirect("/")
}

export async function registerAction(_prev: unknown, formData: FormData) {
  const firstName = formString(formData, "firstName")
  const lastName = formString(formData, "lastName")
  const email = formString(formData, "email")
  const password = formString(formData, "password")
  const phone = formString(formData, "phone")
  const receiveAnnouncements = formData.get("receiveAnnouncements") !== "off"

  if (!firstName || !email || !password || !phone) {
    return failure("errors.requiredFields")
  }

  try {
    await signUp({ firstName, lastName: lastName || undefined, email, password, phone, receiveAnnouncements })
  } catch (error) {
    return actionError(error)
  }
  redirect(ONBOARDING_PATHS.start)
}
