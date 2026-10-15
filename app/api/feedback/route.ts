import { NextResponse } from "next/server"

import { apiFetch } from "@/lib/api/client"
import { getStorefrontSession } from "@/lib/storefront-session"

export const runtime = "nodejs"

const MAX_SHOTS = 3
const MAX_SHOT_BYTES = 4 * 1024 * 1024

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
    return NextResponse.json({ message: "Attach at most 3 screenshots" }, { status: 400 })
  }
  if (shots.some((f) => f.size > MAX_SHOT_BYTES)) {
    return NextResponse.json({ message: "A screenshot is too large" }, { status: 413 })
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
    const status = (error as { status?: number }).status ?? 500
    return NextResponse.json({ message: (error as Error).message || "Feedback could not be sent" }, { status })
  }
}
