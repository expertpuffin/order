import { NextResponse } from "next/server"

import { loginWithPassword } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/errors"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "email and password are required" },
        { status: 400 }
      )
    }

    const user = await loginWithPassword(body.email, body.password)
    return NextResponse.json({ success: true, data: { user } })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    )
  }
}
