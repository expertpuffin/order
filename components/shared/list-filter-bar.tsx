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
      emptyLabel: string
      className?: string
    }

type ListFilterBarProps = {
  action: string
  values: Record<string, string | undefined>
  fields: FilterField[]
  /** Preserve these params when submitting (hidden inputs) */
  preserve?: Record<string, string | undefined>
  submitLabel: string
  clearLabel: string
  clearHref?: string
  className?: string
}

export function ListFilterBar({
  action,
  values,
  fields,
  preserve,
  submitLabel,
  clearLabel,
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
                  <option value="">{field.emptyLabel}</option>
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
