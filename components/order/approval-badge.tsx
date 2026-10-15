"use client"

import { ShieldCheck } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { Badge } from "@/components/ui/badge"
import type { ManagerApprovalState } from "@/lib/types"
import { cn } from "@/lib/utils"

const styles: Record<ManagerApprovalState, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approving: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  withdrawn: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
}

/** The restaurant's own manager sign-off — "izin", never the supplier's "onay". */
export function ApprovalBadge({ state }: { state: ManagerApprovalState }) {
  const t = useT()
  return (
    <Badge variant="outline" className={cn("gap-1 border-transparent", styles[state])}>
      <ShieldCheck className="size-3" aria-hidden />
      {t(`approval.state.${state}`)}
    </Badge>
  )
}
