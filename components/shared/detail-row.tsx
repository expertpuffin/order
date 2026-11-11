/** A label and its value (order details, account, product spec). */
export function DetailRow({
  label,
  value,
  hideEmpty = false,
}: {
  label: string
  value: string | number | null | undefined
  /** Leave the row out instead of showing "—" */
  hideEmpty?: boolean
}) {
  const shown = typeof value === "string" ? value.trim() : value
  if (!shown && hideEmpty) return null
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--border-subtle)] py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-[var(--brand-navy)]">{shown || "—"}</span>
    </div>
  )
}
