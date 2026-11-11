import Link from "next/link"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { Button } from "@/components/ui/button"
import { getTranslator } from "@/lib/i18n"

export async function AccessDenied() {
  const { t } = await getTranslator()
  return (
    <EmptyState
      icon={PUFFIN_ICONS.accessDenied}
      eyebrow={t("access.eyebrow")}
      title={t("access.title")}
      body={t("access.body")}
      actions={
        <Button className="h-10 rounded-[2px] btn-navy" nativeButton={false} render={<Link href="/" />}>
          {t("access.backHome")}
        </Button>
      }
    />
  )
}
