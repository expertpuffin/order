import Link from "next/link"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { FavouritesPanel } from "@/components/order/favourites-panel"
import { Button } from "@/components/ui/button"
import { getFavorites } from "@/lib/api/favorites"
import { getBusinessContext } from "@/lib/business-context"
import { getTranslator } from "@/lib/i18n"
import { hasTeamPermission } from "@/lib/permissions"

export default async function FavouritesPage() {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx) return <AccessDenied />
  if (!hasTeamPermission(ctx.active.permissions, "orders")) {
    return <AccessDenied />
  }

  const { listId, items } = await getFavorites(ctx.active.id)
  const businessName =
    ctx.active.tradingName || ctx.active.businessName || t("nav.favourites")

  return (
    <div className="space-y-5">
      <AccountPageHeader
        data-tour="page-favourites-header"
        eyebrow={t("favourites.sectionLabel")}
        title={t("nav.favourites")}
        description={t("favourites.description", {
          count: String(items.length),
        })}
        actions={
          <Button
            variant="outline"
            className="h-9 rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"
            nativeButton={false}
            render={<Link href="/" />}
          >
            {t("favourites.findMore")}
          </Button>
        }
      />

      {listId ? (
        <FavouritesPanel
          businessId={ctx.active.id}
          listId={listId}
          items={items}
          businessName={businessName}
        />
      ) : (
        <FavouritesPanel
          businessId={ctx.active.id}
          listId=""
          items={[]}
          businessName={businessName}
        />
      )}
    </div>
  )
}
