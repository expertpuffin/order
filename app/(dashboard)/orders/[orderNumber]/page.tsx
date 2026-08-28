import Link from "next/link"
import { notFound } from "next/navigation"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/storefront/account-page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { OrderActions } from "@/components/order/order-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrder } from "@/lib/api/orders"
import { getBusinessContext } from "@/lib/business-context"
import { ApiError } from "@/lib/api/errors"
import { getTranslator } from "@/lib/i18n"
import { getOrderTotal } from "@/lib/mappers"

type OrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ placed?: string }>
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-[var(--brand-navy)]">
        {value || "—"}
      </span>
    </div>
  )
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { t } = await getTranslator()
  const ctx = await getBusinessContext()
  if (!ctx) return <AccessDenied />

  const [paramsResolved, query] = await Promise.all([params, searchParams])
  const id = decodeURIComponent(paramsResolved.orderNumber)

  let order
  try {
    order = await getOrder(id)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  if (order.businessId !== ctx.active.id) return <AccessDenied />

  const total = getOrderTotal(order)
  const reorderable = order.items.some((item) => item.productId)
  const methodLabel =
    order.fulfillmentMethod === "collection"
      ? t("orders.methodCollection")
      : t("orders.methodDelivery")
  const deliveryDateLabel = order.requestedDeliveryDate
    ? new Date(order.requestedDeliveryDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : t("orders.noDate")

  return (
    <div className="space-y-5">
      <AccountPageHeader
        title={order.orderNumber}
        description={t("orders.detailDescription", {
          method: methodLabel,
          date: deliveryDateLabel,
        })}
        actions={
          <div className="flex items-center gap-2">
            {query.placed ? (
              <Badge variant="default">{t("orders.placedOne")}</Badge>
            ) : null}
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/orders" />}
            >
              {t("orders.backToList")}
            </Button>
          </div>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border bg-white p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                  {t("orders.headerTitle")}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t("orders.headerSubtitle")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={order.fulfillmentMethod} />
                <StatusBadge status={order.status} />
              </div>
            </div>

            <DetailRow label={t("orders.fulfillment")} value={methodLabel} />
            <DetailRow
              label={t("orders.requestedDelivery")}
              value={deliveryDateLabel}
            />
            <DetailRow
              label={t("orders.deliveryWindow")}
              value={order.deliveryTime}
            />
            <DetailRow
              label={t("orders.orderDate")}
              value={new Date(order.orderDate).toLocaleString("en-GB")}
            />
            <DetailRow
              label={t("orders.contact")}
              value={order.snapshot.contactName}
            />
            <DetailRow label={t("orders.phone")} value={order.snapshot.contactPhone} />
            <DetailRow
              label={t("orders.address")}
              value={
                [
                  order.snapshot.address.line_1,
                  order.snapshot.address.post_town,
                  order.snapshot.address.postcode,
                ]
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            <Separator className="my-2" />
            <DetailRow label={t("orders.specialNote")} value={order.specialNote} />
            <DetailRow
              label={t("orders.sentBy")}
              value={
                order.snapshot.sentBy.name
                  ? `${order.snapshot.sentBy.name}${order.snapshot.sentBy.email ? ` (${order.snapshot.sentBy.email})` : ""}`
                  : null
              }
            />
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="flex items-baseline justify-between gap-3 border-b px-4 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                {t("orders.itemsTitle")}
              </h2>
              <span className="text-sm text-muted-foreground">
                {t("orders.itemsCount", { count: String(order.items.length) })}
              </span>
            </div>
            <div className="overflow-x-auto table-polish">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t("orders.colSku")}</TableHead>
                    <TableHead>{t("orders.colDescription")}</TableHead>
                    <TableHead>{t("orders.colQty")}</TableHead>
                    <TableHead>{t("orders.colUnit")}</TableHead>
                    <TableHead className="text-right">
                      {t("orders.colCost")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">
                        {item.supplierSku}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.description}</div>
                        {[item.brand, item.packSize, item.comment]
                          .filter(Boolean)
                          .join(" · ") ? (
                          <div className="text-xs text-muted-foreground">
                            {[item.brand, item.packSize, item.comment]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.unitCost != null
                          ? `${item.currency} ${(item.unitCost * item.quantity).toFixed(2)}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end border-t px-4 py-3 text-sm font-semibold text-[var(--brand-navy)] sm:px-6">
              {t("orders.total")}:{" "}
              {total > 0
                ? `£${total.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                  })}`
                : "—"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-lg font-bold text-[var(--brand-navy)]">
              {t("orders.actionsTitle")}
            </h2>
            <OrderActions
              businessId={ctx.active.id}
              orderNumber={order.orderNumber}
              status={order.status}
              hasReorderableItems={reorderable}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              {t("orders.actionsHint")}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-base font-semibold text-[var(--brand-navy)]">
              {t("orders.historyTitle")}
            </h2>
            {order.statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("orders.historyEmpty")}
              </p>
            ) : (
              <div className="space-y-2">
                {order.statusHistory.map((entry, index) => (
                  <div
                    key={`${entry.status}-${entry.at}-${index}`}
                    className="rounded-xl border bg-muted/20 p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <StatusBadge status={entry.status} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.at).toLocaleString("en-GB")}
                      </span>
                    </div>
                    {entry.note ? (
                      <p className="text-xs text-muted-foreground">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
