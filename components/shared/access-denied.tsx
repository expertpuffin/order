import Link from "next/link"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { Button } from "@/components/ui/button"

export function AccessDenied({
  description = "Your staff role does not include this section.",
}: {
  description?: string
}) {
  return (
    <EmptyState
      icon={PUFFIN_ICONS.accessDenied}
      eyebrow="Access"
      title="Access denied"
      body={description}
      actions={
        <Button
          className="h-10 rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      }
    />
  )
}
