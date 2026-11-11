import Link from "next/link"
import { notFound } from "next/navigation"

import { AccessDenied } from "@/components/shared/access-denied"
import { AccountPageHeader } from "@/components/account/account-page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ApprovalBadge } from "@/components/orders/approval-badge"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrderActions } from "@/components/orders/order-actions"
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
import { isApprovalDraft, orderTotal, readPlacedQuery, type Order } from "@/lib/order"
import { getBusinessContext } from "@/lib/business-context"
import { ApiError } from "@/lib/backend/errors"
import { DetailRow } from "@/components/shared/detail-row"
import { getTranslator } from "@/lib/i18n"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"

type OrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ placed?: string; approval?: string }>
}

/** Paid with Ordoria: where the order's money is now ("By card · £84.20 taken"). */
function orderPaymentLabel(
  order: Order,
  t: (key: string, params?: Record<string, string>) => string
) {
  const p = order.payment
  switch (p.status) {
    case "authorized":
      return t("payment.orderHeld", { amount: formatMoney(p.authorizedAmount) })
    case "paid":
      return t("payment.orderTaken", { amount: formatMoney(p.capturedAmount) })
    case "partially_refunded":
      return t("payment.orderPartlyRefunded", {
        amount: formatMoney(p.capturedAmount - p.refundedAmount),
        refund: formatMoney(p.refundedAmount),
      })
    case "refunded":
      return t("payment.orderRefunded", { amount: formatMoney(p.refundedAmount) })
    case "released":
      return t("payment.orderReleased")
    case "expired":
      return t("payment.orderExpired")
    default:
      return t("payment.ordoria")
  }
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { t, locale } = await getTranslator()
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

  const total = orderTotal(order)
  const approval = isApprovalDraft(order) ? order.managerApproval : null
  const placed = readPlacedQuery(query)
  const canApprove = ctx.active.permissions.includes("orders_approve")
  const businessPanelUrl = process.env.NEXT_PUBLIC_BUSINESS_PANEL_URL?.replace(/\/$/, "") || null
  const reorderable = order.items.some((item) => item.productId)
  const methodLabel =
    order.fulfillmentMethod === "collection"
      ? t("orders.methodCollection")
      : t("orders.methodDelivery")
  const deliveryDateLabel = order.requestedDeliveryDate
    ? formatDate(order.requestedDeliveryDate, locale)
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
            {placed.placedCount ? (
              <Badge variant="default">
                {placed.awaitingApproval ? t("approval.placedPending") : t("orders.placedOne")}
              </Badge>
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

      {approval ? (
        <div
          className={
            approval.state === "rejected"
              ? "rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-900"
              : "rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-900"
          }
        >
          <div className="mb-1">
            <ApprovalBadge state={approval.state} />
          </div>
          <p>
            {approval.state === "rejected"
              ? t("approval.bannerRejected", { name: approval.decidedByName ?? "—" })
              : approval.state === "withdrawn"
                ? t("approval.bannerWithdrawn")
                : t("approval.bannerPending")}
          </p>
          {approval.reason ? (
            <p className="mt-1">{t("approval.reason", { reason: approval.reason })}</p>
          ) : null}
          {canApprove && approval.state === "pending" ? (
            <p className="mt-2 text-xs">
              {businessPanelUrl ? (
                <a
                  className="font-medium underline underline-offset-4"
                  href={`${businessPanelUrl}/approvals/${encodeURIComponent(order.orderNumber)}`}
                >
                  {t("approval.decideInPanel")}
                </a>
              ) : (
                t("approval.approverHint")
              )}
            </p>
          ) : null}
        </div>
      ) : order.managerApproval?.state === "approved" ? (
        <p className="text-sm text-muted-foreground">
          {t("approval.bannerApproved", { name: order.managerApproval.decidedByName ?? "—" })}
        </p>
      ) : null}

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
                <OrderStatusBadge order={order} />
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
              value={formatDateTime(order.orderDate, locale)}
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
            {order.payment.mode === "ordoria" ? (
              <DetailRow label={t("payment.orderLabel")} value={orderPaymentLabel(order, t)} />
            ) : null}
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
                          ? formatMoney(item.unitCost * item.quantity, item.currency)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end border-t px-4 py-3 text-sm font-semibold text-[var(--brand-navy)] sm:px-6">
              {t("orders.total")}:{" "}
              {total > 0 ? formatMoney(total, order.currency) : "—"}
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
              managerApproval={order.managerApproval}
              isRequester={order.createdBy === ctx.user.id}
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
                        {formatDateTime(entry.at, locale)}
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
