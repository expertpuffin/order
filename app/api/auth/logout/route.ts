import { NextResponse } from "next/server"

import { logoutSession } from "@/lib/api/auth"
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  USER_COOKIE,
} from "@/lib/auth/session"

export async function POST() {
  await logoutSession()

  const res = NextResponse.json({ success: true, message: "Logged out" })
  const clear = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
  res.cookies.set(ACCESS_COOKIE, "", clear)
  res.cookies.set(REFRESH_COOKIE, "", clear)
  res.cookies.set(USER_COOKIE, "", clear)
  return res
}
