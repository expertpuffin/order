import { cookies } from "next/headers"

import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config"
import { createTranslator, getMessages } from "@/lib/i18n/dictionary"

export async function getLocale(): Promise<Locale> {
  const jar = await cookies()
  const raw = jar.get(localeCookieName)?.value
  return isLocale(raw) ? raw : defaultLocale
}

export async function getTranslator() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return { locale, messages, t: createTranslator(locale, messages) }
}
