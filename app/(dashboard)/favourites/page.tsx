import Link from "next/link"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/account/account-page-header"
import { FavouritesPanel } from "@/components/favourites/favourites-panel"
import { Button } from "@/components/ui/button"
import { getFavorites } from "@/lib/api/favorites"
import { canOrderFor, getBusinessContext } from "@/lib/business-context"
import { getTranslator } from "@/lib/i18n"
import { businessDisplayName } from "@/lib/api/businesses"

export default async function FavouritesPage() {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx || !canOrderFor(ctx.active)) return <AccessDenied />

  const { listId, items } = await getFavorites(ctx.active.id)
  const businessName =
    businessDisplayName(ctx.active) || t("nav.favourites")

  return (
    <div className="space-y-5">
      <AccountPageHeader
        eyebrow={t("favourites.sectionLabel")}
        title={t("nav.favourites")}
        description={t("favourites.description", {
          count: String(items.length),
        })}
        actions={
          <Button
            variant="outline"
            className="h-9 rounded-[2px] border-[var(--border-subtle)] text-[var(--brand-navy)]"
            nativeButton={false}
            render={<Link href="/" />}
          >
            {t("favourites.findMore")}
          </Button>
        }
      />

      <FavouritesPanel businessId={ctx.active.id} listId={listId ?? ""} items={items} businessName={businessName} />
    </div>
  )
}
