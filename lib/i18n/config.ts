/** The UI languages: everything that varies per language is read from here. */
const LOCALES = {
  en: { label: "EN", intl: "en-GB" },
  tr: { label: "TR", intl: "tr-TR" },
} as const

export type Locale = keyof typeof LOCALES

export const locales = Object.keys(LOCALES) as Locale[]

export const defaultLocale: Locale = "en"
export const localeCookieName = "rl_locale"

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in LOCALES
}

/** BCP 47 tag for dates and numbers */
export function intlLocale(locale: Locale): string {
  return LOCALES[locale].intl
}

export function localeLabel(locale: Locale): string {
  return LOCALES[locale].label
}
