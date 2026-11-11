"use client"

import Link from "next/link"

import { choiceClass } from "@/components/brand/choice"
import { useT } from "@/components/i18n/i18n-provider"
import { ORDER_STATUSES } from "@/lib/order"
import { orderListHref, type OrderListQuery } from "@/lib/order-list-query"
import { cn } from "@/lib/utils"

/** "All" plus one tab per order status; switching keeps the filters and starts at page 1. */
export function OrderStatusTabs({ query }: { query: OrderListQuery }) {
  const t = useT()
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {["", ...ORDER_STATUSES].map((status) => (
        <Link
          key={status || "all"}
          href={orderListHref({ ...query, status, page: 1 })}
          className={cn("shrink-0 rounded-[2px] border px-3 py-1.5 text-xs font-medium transition-colors", choiceClass(query.status === status))}
        >
          {status ? t(`status.${status}`) : t("orders.filterAll")}
        </Link>
      ))}
    </div>
  )
}
