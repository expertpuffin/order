"use client"

import { MessageSquareHeart } from "lucide-react"

import { useFeedback } from "@/components/feedback/feedback-dialog"
import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"

/** Help page entry — the account menu is hidden on phones. */
export function SendFeedbackButton() {
  const t = useT()
  const { openFeedback } = useFeedback()
  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 rounded-[2px] border-[var(--sidebar-border)] font-semibold text-[var(--brand-navy)]"
      onClick={openFeedback}
    >
      <MessageSquareHeart className="size-[18px] stroke-[1.75]" />
      {t("feedback.menu")}
    </Button>
  )
}
