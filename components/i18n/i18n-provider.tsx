"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react"

import {
  defaultLocale,
  intlLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config"
import {
  createTranslator,
  type Messages,
  type TranslateValues,
} from "@/lib/i18n/dictionary"

type I18nContextValue = {
  locale: Locale
  t: (key: string, values?: TranslateValues) => string
  setLocale: (locale: Locale) => void
  intlLocale: string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function persistLocale(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${maxAge}; samesite=lax`
}

type I18nProviderProps = {
  locale: Locale
  messages: Messages
  children: ReactNode
}

export function I18nProvider({
  locale: initialLocale,
  messages,
  children,
}: I18nProviderProps) {
  const [, startTransition] = useTransition()
  const locale = isLocale(initialLocale) ? initialLocale : defaultLocale

  const t = useMemo(
    () => createTranslator(locale, messages),
    [locale, messages]
  )

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return
    persistLocale(next)
    startTransition(() => {
      window.location.reload()
    })
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t,
      setLocale,
      intlLocale: intlLocale(locale),
    }),
    [locale, t, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return ctx
}

export function useT() {
  return useI18n().t
}
