import Link from "next/link"
import { Eye } from "lucide-react"

import { EmptyState } from "@/components/brand/empty-state"
import { PUFFIN_ICONS } from "@/components/brand/puffin-icon"
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
        eyebrow={t("orders.sectionLabel")}
        title={t("nav.orders")}
        description={t("orders.description", {
          count: String(pagination.total),
        })}
        actions={
          params.placed ? (
            <Badge
              variant="default"
              className="rounded-[2px] bg-[var(--brand-navy)] text-white"
            >
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
        className="rounded-[2px] border border-[var(--sidebar-border)] bg-white shadow-none"
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
        className="overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-white"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--sidebar-border)] px-4 py-4 sm:px-5">
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
            <ExportTableButton filename="orders" label={t("common.export")} />
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
                  className="h-10 rounded-[2px] bg-[var(--brand-navy)] font-semibold text-white hover:bg-[var(--brand-navy)]/90"
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
                <TableRow className="border-[var(--sidebar-border)] hover:bg-transparent">
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
                  const total = getOrderTotal(order)
                  return (
                    <TableRow
                      key={order.id}
                      className="border-[var(--sidebar-border)]"
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
                      <TableCell className="text-right font-medium tabular-nums text-[var(--brand-navy)]">
                        {total > 0
                          ? `£${total.toLocaleString("en-GB", {
                              minimumFractionDigits: 2,
                            })}`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="size-8 rounded-[2px] border-[var(--sidebar-border)]"
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
          <div className="border-t border-[var(--sidebar-border)] px-4 py-3">
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
