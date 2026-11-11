"use server"

import { redirect } from "next/navigation"

import {
  createBusinessApplication,
  listTeamRoleNames,
  lookupPostcode,
  resendVerificationEmail,
  saveAcquisition,
  verifyEmailCode,
} from "@/lib/api/onboarding"
import { actionError, formString } from "@/lib/actions/result"
import { ApiError } from "@/lib/backend/errors"

export async function verifyEmailAction(_prev: unknown, formData: FormData) {
  const code = formString(formData, "code")
  const email = formString(formData, "email")
  if (!code || code.length < 6) {
    return { error: "Enter the 6-digit code" }
  }
  try {
    await verifyEmailCode({ code, email: email || undefined })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding")
}

export async function resendVerificationAction() {
  try {
    await resendVerificationEmail()
    return { success: true as const }
  } catch (error) {
    return actionError(error)
  }
}

export async function saveAcquisitionAction(_prev: unknown, formData: FormData) {
  const source = formString(formData, "source")
  const otherText = formString(formData, "otherText")
  if (!source) return { error: "Please select a source" }
  try {
    await saveAcquisition({
      source,
      otherText: otherText || undefined,
    })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding/business")
}

export async function createBusinessAction(_prev: unknown, formData: FormData) {
  const businessName = formString(formData, "businessName")
  const tradingName = formString(formData, "tradingName") || businessName
  const businessType = formString(formData, "businessType")
  const line1 = formString(formData, "line1")
  const line2 = formString(formData, "line2")
  const postTown = formString(formData, "postTown")
  const county = formString(formData, "county")
  const postcode = formString(formData, "postcode")
  const latitudeRaw = formString(formData, "latitude")
  const longitudeRaw = formString(formData, "longitude")
  const contactFirstName = formString(formData, "contactFirstName")
  const contactLastName = formString(formData, "contactLastName")
  const contactPhone = formString(formData, "contactPhone")
  const mainBusinessEmail = formString(formData, "mainBusinessEmail")
  const mainBusinessPhone = formString(formData, "mainBusinessPhone")
  const isOwner = formData.get("isOwner") === "on"
  const ownerFirstName = formString(formData, "ownerFirstName")
  const ownerLastName = formString(formData, "ownerLastName")
  const ownerEmail = formString(formData, "ownerEmail")
  const ownerPhone = formString(formData, "ownerPhone")
  const applicantRole = formString(formData, "applicantRole")
  const openTime = formString(formData, "openTime") || "09:00"
  const closeTime = formString(formData, "closeTime") || "22:00"
  const deliveryTime = formString(formData, "deliveryTime") || "11:00-13:00"

  if (!businessName || !businessType || !line1 || !postcode || !contactFirstName || !contactPhone) {
    return { error: "Please fill all required business fields" }
  }

  if (!isOwner && (!ownerFirstName || !ownerEmail)) {
    return {
      error: "Owner first name and email are required when you are not the owner",
    }
  }

  if (!isOwner && !applicantRole) {
    return { error: "Please select your role in the business" }
  }

  try {
    await createBusinessApplication({
      businessName,
      tradingName,
      businessType,
      address: {
        line_1: line1,
        line_2: line2 || undefined,
        post_town: postTown || undefined,
        county: county || undefined,
        postcode,
        latitude: latitudeRaw ? Number(latitudeRaw) : undefined,
        longitude: longitudeRaw ? Number(longitudeRaw) : undefined,
      },
      contactFirstName,
      contactLastName: contactLastName || undefined,
      contactPhone,
      mainBusinessEmail: mainBusinessEmail || undefined,
      mainBusinessPhone: mainBusinessPhone || undefined,
      isOwner,
      ownerDetails: !isOwner
        ? {
            firstName: ownerFirstName,
            lastName: ownerLastName || undefined,
            email: ownerEmail,
            phone: ownerPhone || null,
          }
        : undefined,
      applicantRole: isOwner ? "Owner" : applicantRole || undefined,
      openTime,
      closeTime,
      deliveryTime,
    })
  } catch (error) {
    return actionError(error)
  }
  redirect("/onboarding/pending")
}

export async function lookupPostcodeAction(postcode: string) {
  const trimmed = postcode.trim()
  if (!trimmed) return { error: "Enter a postcode", addresses: [] as const }

  try {
    const data = await lookupPostcode(trimmed)
    return { addresses: data.addresses ?? [] }
  } catch (error) {
    // The lookup provider is out of credit (402) or knows no address (404): the form says so and offers manual entry
    const status = error instanceof ApiError ? error.status : 0
    if (status === 402) return { error: "Postcode lookup unavailable", code: "lookup_unavailable", addresses: [] as const }
    if (status === 404) return { error: "No addresses found", code: "no_addresses", addresses: [] as const }
    return { ...actionError(error), addresses: [] as const }
  }
}

export async function listTeamRoleNamesAction() {
  return { names: await listTeamRoleNames() }
}
