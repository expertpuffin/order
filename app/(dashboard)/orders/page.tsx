import Link from "next/link"
import { Eye } from "lucide-react"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
import { AccessDenied } from "@/components/shared/access-denied"
import { ExportTableButton } from "@/components/shared/export-table-button"
import { ListFilterBar, ListPagination } from "@/components/shared/list-filter-bar"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { OrderStatusTabs } from "@/components/orders/order-status-tabs"
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
import { listBusinessOrders } from "@/lib/api/orders"
import { getBusinessContext } from "@/lib/business-context"
import { getTranslator } from "@/lib/i18n"
import { orderTotal, readPlacedQuery } from "@/lib/order"
import { hasOrderFilters, orderFilters, orderListHref, parseOrderListQuery } from "@/lib/order-list-query"
import { formatDate, formatMoney } from "@/lib/format"

type OrdersPageProps = {
  searchParams: Promise<{
    status?: string
    page?: string
    placed?: string
    q?: string
    method?: string
    deliveryFrom?: string
    deliveryTo?: string
    orderDateFrom?: string
    orderDateTo?: string
  }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { t, locale } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx) return <AccessDenied />

  const query = parseOrderListQuery(await searchParams)
  const filters = orderFilters(query)
  const { orders, pagination } = await listBusinessOrders(ctx.active.id, {
    status: query.status || undefined,
    page: query.page,
    limit: 20,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
  })
  const hasActiveFilters = hasOrderFilters(query)
  const { placedCount } = readPlacedQuery(query)

  return (
    <div className="space-y-5">
      <AccountPageHeader
        eyebrow={t("orders.sectionLabel")}
        title={t("nav.orders")}
        description={t("orders.description", {
          count: String(pagination.total),
        })}
        actions={
          placedCount ? (
            <Badge
              variant="default"
              className="rounded-[2px] bg-[var(--brand-orange)] text-white"
            >
              {placedCount === 1
                ? t("orders.placedOne")
                : t("orders.placedMany", { count: String(placedCount) })}
            </Badge>
          ) : null
        }
      />

      <OrderStatusTabs query={query} />

      <ListFilterBar
        action="/orders"
        values={filters}
        preserve={{ status: query.status || undefined, placed: query.placed || undefined }}
        submitLabel={t("common.search")}
        clearLabel={t("common.clear")}
        clearHref={orderListHref({ status: query.status, placed: query.placed })}
        className="rounded-[2px] border border-[var(--border-subtle)] bg-white shadow-none"
        fields={[
          {
            type: "text",
            name: "q",
            label: t("orders.searchLabel"),
            placeholder: t("orders.searchPlaceholder"),
            className: "min-w-[220px] flex-[2]",
          },
          {
            type: "select",
            name: "method",
            label: t("orders.colMethod"),
            emptyLabel: t("orders.filterAll"),
            options: [
              { value: "delivery", label: t("orders.methodDelivery") },
              { value: "collection", label: t("orders.methodCollection") },
            ],
          },
          {
            type: "date",
            name: "orderDateFrom",
            label: t("orders.orderDateFrom"),
          },
          {
            type: "date",
            name: "orderDateTo",
            label: t("orders.orderDateTo"),
          },
          {
            type: "date",
            name: "deliveryFrom",
            label: t("orders.deliveryFrom"),
          },
          {
            type: "date",
            name: "deliveryTo",
            label: t("orders.deliveryTo"),
          },
        ]}
      />

      <div
        data-export-root
        className="overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-white"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-5">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("orders.sectionLabel")}
            </p>
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
              {t("orders.listTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {hasActiveFilters
                ? t("orders.filteredCount", {
                    count: String(pagination.total),
                  })
                : t("orders.showingCount", {
                    count: String(orders.length),
                    total: String(pagination.total),
                  })}
            </p>
          </div>
          {orders.length > 0 ? (
            <ExportTableButton filename="orders" />
          ) : null}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            framed={false}
            icon={PUFFIN_ICONS.emptyOrders}
            title={
              hasActiveFilters || status
                ? t("orders.emptyFiltered")
                : t("orders.empty")
            }
            body={t("orders.emptyHint")}
            actions={
              !hasActiveFilters && !status ? (
                <Button
                  className="h-10 rounded-[2px] btn-navy"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  {t("nav.catalog")}
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border-subtle)] hover:bg-transparent">
                  <TableHead className="h-10 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t("orders.colOrder")}
                  </TableHead>
                  <TableHead className="h-10 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t("orders.colSupplier")}
                  </TableHead>
                  <TableHead className="h-10 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t("orders.colMethod")}
                  </TableHead>
                  <TableHead className="h-10 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t("orders.colDelivery")}
                  </TableHead>
                  <TableHead className="h-10 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t("orders.colStatus")}
                  </TableHead>
                  <TableHead className="h-10 text-right font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    {t("orders.colAmount")}
                  </TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const total = orderTotal(order)
                  return (
                    <TableRow
                      key={order.id}
                      className="border-[var(--border-subtle)]"
                    >
                      <TableCell>
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="font-mono text-xs font-semibold text-[var(--brand-navy)] underline-offset-4 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                          {t("orders.itemCount", {
                            count: String(order.items.length),
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-[var(--brand-navy)]">
                        {order.supplier.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.fulfillmentMethod} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {order.requestedDeliveryDate ? (
                          <>
                            {formatDate(order.requestedDeliveryDate, locale)}
                            {order.deliveryTime ? (
                              <span className="text-muted-foreground">
                                {" "}
                                · {order.deliveryTime}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge order={order} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-[var(--brand-navy)]">
                        {total > 0 ? formatMoney(total, order.currency) : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="size-8 rounded-[2px] border-[var(--border-subtle)]"
                          nativeButton={false}
                          render={
                            <Link href={`/orders/${order.orderNumber}`} />
                          }
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">{t("orders.view")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {orders.length > 0 ? (
          <div className="border-t border-[var(--border-subtle)] px-4 py-3">
            <ListPagination
              basePath="/orders"
              pagination={pagination}
              searchParams={{ status: query.status || undefined, ...filters }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
