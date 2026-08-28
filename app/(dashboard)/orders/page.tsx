import Link from "next/link"
import { Eye, Package } from "lucide-react"

import { AccessDenied } from "@/components/shared/access-denied"
import { ExportTableButton } from "@/components/shared/export-table-button"
import { ListFilterBar, ListPagination } from "@/components/shared/list-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { OrderStatusTabs } from "@/components/storefront/order-status-tabs"
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
import { getOrderTotal } from "@/lib/mappers"

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

function buildQueryHref(base: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(base)) {
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `/orders?${qs}` : "/orders"
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx) return <AccessDenied />

  const params = await searchParams
  const status = params.status || ""
  const page = Math.max(1, Number(params.page) || 1)
  const q = params.q?.trim() || ""
  const method = params.method || ""
  const deliveryFrom = params.deliveryFrom || ""
  const deliveryTo = params.deliveryTo || ""
  const orderDateFrom = params.orderDateFrom || ""
  const orderDateTo = params.orderDateTo || ""

  const filterValues = {
    q,
    method,
    deliveryFrom,
    deliveryTo,
    orderDateFrom,
    orderDateTo,
  }

  const preserveForTabs = {
    ...filterValues,
    placed: params.placed,
  }

  const queryForPager = {
    status: status || undefined,
    ...filterValues,
  }

  const { orders, pagination } = await listBusinessOrders(ctx.active.id, {
    status: status || undefined,
    page,
    limit: 20,
    q: q || undefined,
    method: method || undefined,
    deliveryFrom: deliveryFrom || undefined,
    deliveryTo: deliveryTo || undefined,
    orderDateFrom: orderDateFrom || undefined,
    orderDateTo: orderDateTo || undefined,
  })

  const hasActiveFilters = Boolean(
    q || method || deliveryFrom || deliveryTo || orderDateFrom || orderDateTo
  )

  const clearFiltersHref = buildQueryHref({
    status: status || undefined,
    placed: params.placed,
  })

  return (
    <div className="space-y-5">
      <AccountPageHeader
        title={t("nav.orders")}
        description={t("orders.description", {
          count: String(pagination.total),
        })}
        actions={
          params.placed ? (
            <Badge variant="default">
              {params.placed === "1"
                ? t("orders.placedOne")
                : t("orders.placedMany", { count: params.placed })}
            </Badge>
          ) : null
        }
      />

      <OrderStatusTabs active={status} preserve={preserveForTabs} />

      <ListFilterBar
        action="/orders"
        values={filterValues}
        preserve={{
          status: status || undefined,
          placed: params.placed,
        }}
        submitLabel={t("common.search")}
        clearLabel={t("common.clear")}
        clearHref={clearFiltersHref}
        className="rounded-2xl border bg-white shadow-none"
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
        className="overflow-hidden rounded-2xl border bg-white"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-[var(--brand-navy)]">
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
            <ExportTableButton filename="orders" label={t("common.export")} />
          ) : null}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted/60">
              <Package className="size-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[var(--brand-navy)]">
                {hasActiveFilters || status
                  ? t("orders.emptyFiltered")
                  : t("orders.empty")}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t("orders.emptyHint")}
              </p>
            </div>
            {!hasActiveFilters && !status ? (
              <Button nativeButton={false} render={<Link href="/" />}>
                {t("nav.catalog")}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto table-polish">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t("orders.colOrder")}</TableHead>
                  <TableHead>{t("orders.colSupplier")}</TableHead>
                  <TableHead>{t("orders.colMethod")}</TableHead>
                  <TableHead>{t("orders.colDelivery")}</TableHead>
                  <TableHead>{t("orders.colStatus")}</TableHead>
                  <TableHead className="text-right">
                    {t("orders.colAmount")}
                  </TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const total = getOrderTotal(order)
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/orders/${order.orderNumber}`}
                          className="font-mono text-xs font-semibold hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {t("orders.itemCount", {
                            count: String(order.items.length),
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">
                        {order.supplier.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.fulfillmentMethod} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {order.requestedDeliveryDate ? (
                          <>
                            {new Date(
                              order.requestedDeliveryDate
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
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
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {total > 0
                          ? `£${total.toLocaleString("en-GB", {
                              minimumFractionDigits: 2,
                            })}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          render={
                            <Link href={`/orders/${order.orderNumber}`} />
                          }
                        >
                          <Eye />
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
          <div className="border-t px-4 py-3">
            <ListPagination
              basePath="/orders"
              pagination={pagination}
              searchParams={queryForPager}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
