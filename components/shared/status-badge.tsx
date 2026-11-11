"use client"

import { useT } from "@/components/i18n/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Order statuses, fulfilment methods and business statuses — what this panel shows. Labels: messages `status.*`. */
const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700",
  approved: "bg-emerald-500/10 text-emerald-700",
  rejected: "bg-red-500/10 text-red-700",
  suspended: "bg-zinc-500/10 text-zinc-600",
  draft: "bg-sky-500/10 text-sky-700",
  submitted: "bg-amber-500/10 text-amber-700",
  sent: "bg-blue-500/10 text-blue-700",
  confirmed: "bg-indigo-500/10 text-indigo-700",
  out_for_delivery: "bg-violet-500/10 text-violet-700",
  ready_for_collection: "bg-violet-500/10 text-violet-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  collected: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-red-500/10 text-red-700",
  delivery: "bg-sky-500/10 text-sky-700",
  collection: "bg-indigo-500/10 text-indigo-700",
}

export function StatusBadge({ status }: { status: string }) {
  const t = useT()
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", statusStyles[status])}>
      {t(`status.${status}`)}
    </Badge>
  )
}
