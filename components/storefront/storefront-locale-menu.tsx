"use client"

import { useI18n } from "@/components/i18n/i18n-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { localeLabel, locales } from "@/lib/i18n/config"

/** Language switch in the top bar's rail. */
export function StorefrontLocaleMenu() {
  const { locale, setLocale, t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 w-10 items-center justify-center text-sm font-medium text-[var(--brand-navy)] outline-none transition-colors hover:bg-muted/60 data-open:bg-muted/60"
        aria-label={t("common.language")}
      >
        <span>{localeLabel(locale)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-28 rounded-[2px] p-1">
        {locales.map((value) => (
          <DropdownMenuItem
            key={value}
            className="justify-center py-2 font-semibold"
            onClick={() => {
              if (value !== locale) setLocale(value)
            }}
          >
            {localeLabel(value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
