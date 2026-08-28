export const locales = ["en", "tr"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"
export const localeCookieName = "rl_locale"

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "tr"
}

/** BCP 47 tag for dates / currency */
export function intlLocale(locale: Locale): string {
  return locale === "tr" ? "tr-TR" : "en-GB"
}
