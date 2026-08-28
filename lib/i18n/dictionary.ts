import type { Locale } from "@/lib/i18n/config"
import { defaultLocale } from "@/lib/i18n/config"
import en from "@/messages/en.json"
import tr from "@/messages/tr.json"

export type Messages = typeof en

const catalogs: Record<Locale, Messages> = {
  en,
  tr: tr as Messages,
}

export type TranslateValues = Record<string, string | number>

function lookup(messages: Messages, key: string): string | undefined {
  const parts = key.split(".")
  let cur: unknown = messages
  for (const part of parts) {
    if (!cur || typeof cur !== "object" || !(part in cur)) return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === "string" ? cur : undefined
}

function interpolate(template: string, values?: TranslateValues): string {
  if (!values) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    values[name] != null ? String(values[name]) : `{${name}}`
  )
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs[defaultLocale]
}

export function createTranslator(locale: Locale, messages?: Messages) {
  const primary = messages ?? getMessages(locale)
  const fallback = catalogs[defaultLocale]

  return function t(key: string, values?: TranslateValues): string {
    const raw = lookup(primary, key) ?? lookup(fallback, key) ?? key
    return interpolate(raw, values)
  }
}
