import { NextResponse } from "next/server"

import { apiFetch } from "@/lib/api/client"
import { ApiError } from "@/lib/backend/errors"
import { FEEDBACK_ERRORS, MAX_SHOTS, MAX_SHOTS_BYTES } from "@/lib/feedback-contract"
import { getStorefrontSession } from "@/lib/storefront-session"

export const runtime = "nodejs"

/**
 * Feedback from the panel → backend. The browser can't reach the API with
 * the session cookie, so the form (rating, message, meta, screenshots) is
 * passed through here; the business and source are set server-side.
 */
export async function POST(request: Request) {
  const session = await getStorefrontSession()
  if (!session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ message: "Invalid form" }, { status: 400 })
  }

  const shots = form.getAll("screenshots").filter((v): v is File => v instanceof File)
  if (shots.length > MAX_SHOTS) {
    return NextResponse.json({ code: FEEDBACK_ERRORS.tooMany }, { status: 400 })
  }
  if (shots.reduce((sum, f) => sum + f.size, 0) > MAX_SHOTS_BYTES) {
    return NextResponse.json({ code: FEEDBACK_ERRORS.tooLarge }, { status: 413 })
  }

  const out = new FormData()
  out.set("rating", String(form.get("rating") ?? ""))
  out.set("message", String(form.get("message") ?? ""))
  out.set("meta", String(form.get("meta") ?? "{}"))
  out.set("source", "order_web")
  if (session.businessId) out.set("businessId", session.businessId)
  shots.forEach((file, i) => out.append("screenshots", file, file.name || `screenshot-${i + 1}.webp`))

  try {
    const data = await apiFetch<{ feedback: { id: string } }>("/api/feedback", {
      method: "POST",
      formData: out,
    })
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({}, { status: error instanceof ApiError ? error.status : 500 })
  }
}
