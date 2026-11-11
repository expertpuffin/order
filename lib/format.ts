import { intlLocale, type Locale } from "@/lib/i18n/config"

/**
 * Prices are UK prices, so they read the same in every UI language ("£1,234.50").
 * Dates follow the UI language.
 */
export function formatMoney(amount: number, currency = "GBP") {
  // Intl throws on a malformed code (e.g. ""), which would take the whole page down
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "GBP"
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: code }).format(amount)
}

/** "12 Nov 2026" */
export function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(intlLocale(locale), { day: "numeric", month: "short", year: "numeric" })
}

/** "12 Nov 2026, 14:05" */
export function formatDateTime(iso: string, locale: Locale) {
  return new Date(iso).toLocaleString(intlLocale(locale), { dateStyle: "medium", timeStyle: "short" })
}
