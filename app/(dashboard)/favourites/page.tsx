import Link from "next/link"
import { Heart } from "lucide-react"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { AddToCart } from "@/components/order/add-to-cart"
import { FavoriteToggle } from "@/components/order/favorite-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

  const { items } = await getFavorites(ctx.active.id)

  return (
    <div className="space-y-5">
      <AccountPageHeader
        title={t("nav.favourites")}
        description={t("favourites.description", {
          count: String(items.length),
        })}
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            {t("favourites.findMore")}
          </Button>
        }
      />

      <div
        data-tour="page-favourites-table"
        className="overflow-hidden rounded-2xl border bg-white"
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/60">
              <Heart className="size-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[var(--brand-navy)]">
                {t("favourites.emptyTitle")}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t("favourites.emptyBody")}
              </p>
            </div>
            <Button nativeButton={false} render={<Link href="/" />}>
              {t("nav.catalog")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto table-polish">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("favourites.colProduct")}</TableHead>
                  <TableHead>{t("favourites.colUnits")}</TableHead>
                  <TableHead className="text-right">
                    {t("favourites.colActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {item.name.slice(0, 1)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{item.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {[item.brand, item.packSize]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.packagingOptions.map((option) => (
                          <Badge
                            key={option}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <AddToCart
                          businessId={ctx.active.id}
                          productId={item.productId}
                          packagingOptions={item.packagingOptions}
                        />
                        <FavoriteToggle
                          businessId={ctx.active.id}
                          productId={item.productId}
                          favorited={true}
                          favoriteItemId={item.itemId}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
