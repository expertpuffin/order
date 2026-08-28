"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import type { Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "tr", label: "TR" },
]

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border/60 p-0.5",
        className
      )}
      role="group"
      aria-label={t("common.language")}
    >
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant={locale === opt.value ? "secondary" : "ghost"}
          className="h-7 min-w-8 px-2 text-xs font-semibold"
          aria-pressed={locale === opt.value}
          onClick={() => {
            if (opt.value !== locale) setLocale(opt.value)
          }}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
