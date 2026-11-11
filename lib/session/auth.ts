import { cookies } from "next/headers"

import { requestSession, revokeSession } from "@/lib/session/backend"
import { clearSession, getSessionTokens, writeSession } from "@/lib/session/cookies"

/** Merchant panels share accounts with the admin panel: /api/auth/login accepts app users too. */
export async function signIn(email: string, password: string) {
  const session = await requestSession("/api/auth/login", { email, password }, "Login failed")
  writeSession(await cookies(), session)
}

export async function signUp(input: {
  firstName: string
  lastName?: string
  email: string
  password: string
  phone: string
  receiveAnnouncements?: boolean
}) {
  const session = await requestSession("/api/auth/register", input, "Registration failed")
  writeSession(await cookies(), session)
}

export async function signOut() {
  const { refreshToken } = await getSessionTokens()
  await revokeSession(refreshToken)
  clearSession(await cookies())
}
