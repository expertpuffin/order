import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type FilterField =
  | {
      type: "text"
      name: string
      label: string
      placeholder?: string
      className?: string
    }
  | {
      type: "date"
      name: string
      label: string
      className?: string
    }
  | {
      type: "select"
      name: string
      label: string
      options: Array<{ value: string; label: string }>
      allowEmpty?: boolean
      emptyLabel?: string
      className?: string
    }

type ListFilterBarProps = {
  action: string
  values: Record<string, string | undefined>
  fields: FilterField[]
  /** Preserve these params when submitting (hidden inputs) */
  preserve?: Record<string, string | undefined>
  submitLabel?: string
  clearLabel?: string
  clearHref?: string
  className?: string
}

export function ListFilterBar({
  action,
  values,
  fields,
  preserve,
  submitLabel = "Search",
  clearLabel = "Clear",
  clearHref,
  className,
}: ListFilterBarProps) {
  const resolvedClearHref = clearHref ?? action

  return (
    <form
      action={action}
      method="get"
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4",
        className
      )}
    >
      {preserve
        ? Object.entries(preserve).map(([key, value]) =>
            value ? (
              <input key={key} type="hidden" name={key} value={value} />
            ) : null
          )
        : null}

      <div className="flex flex-wrap items-end gap-3">
        {fields.map((field) => {
          if (field.type === "text") {
            return (
              <label
                key={field.name}
                className={cn("flex min-w-[180px] flex-1 flex-col gap-1", field.className)}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </span>
                <Input
                  name={field.name}
                  defaultValue={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                />
              </label>
            )
          }

          if (field.type === "date") {
            return (
              <label
                key={field.name}
                className={cn("flex min-w-[140px] flex-col gap-1", field.className)}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </span>
                <Input
                  type="date"
                  name={field.name}
                  defaultValue={values[field.name] ?? ""}
                />
              </label>
            )
          }

          return (
            <label
              key={field.name}
              className={cn("flex min-w-[140px] flex-col gap-1", field.className)}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {field.label}
              </span>
              <select
                name={field.name}
                defaultValue={values[field.name] ?? ""}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                {field.allowEmpty !== false ? (
                  <option value="">{field.emptyLabel ?? "All"}</option>
                ) : null}
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          )
        })}

        <div className="flex gap-2 pb-0.5">
          <Button type="submit" size="sm">
            {submitLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={resolvedClearHref} />}
          >
            {clearLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

type ListPaginationProps = {
  basePath: string
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    pageFrom?: number
    pageTo?: number
    range?: boolean
  }
  searchParams: Record<string, string | undefined>
  /** Max pages that can be loaded in one range request */
  maxRangePages?: number
}

export function ListPagination({
  basePath,
  pagination,
  searchParams,
  maxRangePages = 40,
}: ListPaginationProps) {
  if (pagination.pages <= 1 && !pagination.range) return null

  const rangeFrom = pagination.pageFrom ?? pagination.page
  const rangeTo = pagination.pageTo ?? pagination.page
  const span = Math.max(1, rangeTo - rangeFrom + 1)
  const inRange = Boolean(pagination.range) || rangeFrom !== rangeTo

  const hrefFor = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...searchParams, ...patch })) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const clearRange = {
    pageFrom: undefined,
    pageTo: undefined,
    page: String(rangeFrom),
  }

  const prevHref = inRange
    ? (() => {
        const nextTo = rangeFrom - 1
        if (nextTo < 1) return null
        const nextFrom = Math.max(1, nextTo - span + 1)
        return hrefFor({
          page: undefined,
          pageFrom: String(nextFrom),
          pageTo: String(nextTo),
        })
      })()
    : pagination.page > 1
      ? hrefFor({
          page: String(pagination.page - 1),
          pageFrom: undefined,
          pageTo: undefined,
        })
      : null

  const nextHref = inRange
    ? (() => {
        const nextFrom = rangeTo + 1
        if (nextFrom > pagination.pages) return null
        const nextTo = Math.min(pagination.pages, nextFrom + span - 1)
        return hrefFor({
          page: undefined,
          pageFrom: String(nextFrom),
          pageTo: String(nextTo),
        })
      })()
    : pagination.page < pagination.pages
      ? hrefFor({
          page: String(pagination.page + 1),
          pageFrom: undefined,
          pageTo: undefined,
        })
      : null

  // Preserve filters in the range form; drop single-page `page` when applying a range
  const preserved = Object.entries(searchParams).filter(
    ([k, v]) => v && k !== "page" && k !== "pageFrom" && k !== "pageTo"
  )

  return (
    <div className="flex flex-col gap-3 border-t pt-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          {inRange ? (
            <>
              Pages {rangeFrom}–{rangeTo} / {pagination.pages} ·{" "}
              {pagination.total.toLocaleString()} total
            </>
          ) : (
            <>
              Page {pagination.page} / {pagination.pages} ·{" "}
              {pagination.total.toLocaleString()} total
            </>
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          {prevHref ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={prevHref} />}
            >
              Previous
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Previous
            </Button>
          )}
          {nextHref ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={nextHref} />}
            >
              Next
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Next
            </Button>
          )}
          {inRange ? (
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href={hrefFor(clearRange)} />}
            >
              Single page
            </Button>
          ) : null}
        </div>
      </div>

      <form
        action={basePath}
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 px-3 py-2.5"
      >
        {preserved.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <span className="pb-1.5 text-xs font-medium text-muted-foreground">
          Show pages
        </span>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            From
          </span>
          <Input
            name="pageFrom"
            type="number"
            min={1}
            max={pagination.pages}
            defaultValue={rangeFrom}
            className="h-8 w-20"
            required
          />
        </label>
        <span className="pb-1.5 text-muted-foreground">–</span>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            To
          </span>
          <Input
            name="pageTo"
            type="number"
            min={1}
            max={pagination.pages}
            defaultValue={rangeTo}
            className="h-8 w-20"
            required
          />
        </label>
        <Button type="submit" size="sm" className="mb-0.5">
          Apply
        </Button>
        <span className="pb-1.5 text-[11px] text-muted-foreground">
          e.g. 1–10 or 14–40 (max {maxRangePages} pages / request)
        </span>
      </form>
    </div>
  )
}
