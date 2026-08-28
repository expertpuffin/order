"use client"

import { Badge } from "@/components/ui/badge"
import { useT } from "@/components/i18n/i18n-provider"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  hidden: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  suspended: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  draft: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  archived: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  sending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  partial: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  submitted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  sent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  confirmed: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  out_for_delivery: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  out_of_stock: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  preparing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  collected: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  ready_for_collection: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  delivery: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  collection: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
  disabled: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  invited: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failure: "bg-red-500/10 text-red-700 dark:text-red-400",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  open: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  uncollectible: "bg-red-500/10 text-red-700 dark:text-red-400",
  void: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
}

export function StatusBadge({
  status,
  label,
}: {
  status: string
  label?: string
}) {
  const t = useT()
  const key = `status.${status}`
  const translated = t(key)
  const text =
    label ?? (translated !== key ? translated : status.replaceAll("_", " "))

  return (
    <Badge
      variant="outline"
      className={cn("border-transparent capitalize", statusStyles[status])}
    >
      {text}
    </Badge>
  )
}
