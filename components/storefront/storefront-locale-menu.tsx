"use client"

import { ChevronDown, Globe } from "lucide-react"

import { useI18n } from "@/components/i18n/i18n-provider"
import type { Locale } from "@/lib/i18n/config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "tr", label: "TR" },
  { value: "en", label: "EN" },
]

export function StorefrontLocaleMenu({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  const active = OPTIONS.find((o) => o.value === locale) ?? OPTIONS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[var(--brand-navy)] outline-none hover:bg-muted/60 data-open:bg-muted/60",
          className
        )}
        aria-label={t("common.language")}
      >
        <Globe className="size-[18px] stroke-[1.75]" />
        <span>{active.label}</span>
        <ChevronDown className="size-4 text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-28 rounded-xl p-1">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            className="justify-center py-2 font-semibold"
            onClick={() => {
              if (opt.value !== locale) setLocale(opt.value)
            }}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
