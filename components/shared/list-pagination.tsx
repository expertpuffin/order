"use client"

import Link from "next/link"

import { useI18n } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { intlLocale } from "@/lib/i18n/config"
import type { Pagination } from "@/lib/pagination"

export function ListPagination({
  pagination,
  prevHref,
  nextHref,
}: {
  pagination: Pagination
  prevHref: string | null
  nextHref: string | null
}) {
  const { t, locale } = useI18n()
  if (pagination.pages <= 1) return null

  const link = (href: string | null, label: string) =>
    href ? (
      <Button size="sm" variant="outline" nativeButton={false} render={<Link href={href} />}>
        {label}
      </Button>
    ) : (
      <Button size="sm" variant="outline" disabled>
        {label}
      </Button>
    )

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm text-muted-foreground">
      <span>
        {t("pagination.summary", {
          page: String(pagination.page),
          pages: String(pagination.pages),
          total: pagination.total.toLocaleString(intlLocale(locale)),
        })}
      </span>
      <div className="flex gap-2">
        {link(prevHref, t("pagination.previous"))}
        {link(nextHref, t("pagination.next"))}
      </div>
    </div>
  )
}
