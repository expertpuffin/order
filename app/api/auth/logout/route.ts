import { NextResponse } from "next/server"

import { logoutSession } from "@/lib/api/auth"
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  USER_COOKIE,
  cookieOptions,
} from "@/lib/auth/session"

export async function POST() {
  await logoutSession()

  const res = NextResponse.json({ success: true, message: "Logged out" })
  // Same domain as when they were set (AUTH_COOKIE_DOMAIN) — see logoutSession
  const clear = cookieOptions(0)
  res.cookies.set(ACCESS_COOKIE, "", clear)
  res.cookies.set(REFRESH_COOKIE, "", clear)
  res.cookies.set(USER_COOKIE, "", clear)
  return res
}
