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

type StorefrontLocaleMenuProps = {
  className?: string
  variant?: "default" | "rail"
}

export function StorefrontLocaleMenu({
  className,
  variant = "default",
}: StorefrontLocaleMenuProps) {
  const { locale, setLocale, t } = useI18n()
  const active = OPTIONS.find((o) => o.value === locale) ?? OPTIONS[0]
  const rail = variant === "rail"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "outline-none",
          rail
            ? "inline-flex h-9 w-10 items-center justify-center text-sm font-medium text-[var(--brand-navy)] transition-colors hover:bg-muted/60 data-open:bg-muted/60"
            : "inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[var(--brand-navy)] hover:bg-muted/60 data-open:bg-muted/60",
          className
        )}
        aria-label={t("common.language")}
      >
        {rail ? (
          <span>{active.label}</span>
        ) : (
          <>
            <Globe className="size-[18px] stroke-[1.75]" />
            <span>{active.label}</span>
            <ChevronDown className="size-4 text-primary" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("min-w-28 p-1", rail ? "rounded-[2px]" : "rounded-xl")}
      >
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
