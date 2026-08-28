import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type OrdersTablePaginationProps = {
  basePath: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  searchParams: Record<string, string | undefined>
  rangeLabel: string
  previousLabel: string
  nextLabel: string
  className?: string
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value)
  }
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function OrdersTablePagination({
  basePath,
  pagination,
  searchParams,
  rangeLabel,
  previousLabel,
  nextLabel,
  className,
}: OrdersTablePaginationProps) {
  if (pagination.total === 0) return null

  const from =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1
  const to = Math.min(pagination.page * pagination.limit, pagination.total)

  const prevHref =
    pagination.page > 1
      ? buildHref(basePath, searchParams, pagination.page - 1)
      : null
  const nextHref =
    pagination.page < pagination.pages
      ? buildHref(basePath, searchParams, pagination.page + 1)
      : null

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {rangeLabel
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", pagination.total.toLocaleString())}
      </p>
      <div className="flex items-center gap-2">
        {prevHref ? (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={prevHref} />}
          >
            {previousLabel}
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled>
            {previousLabel}
          </Button>
        )}
        {nextHref ? (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={nextHref} />}
          >
            {nextLabel}
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
