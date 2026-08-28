"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type OrdersRowMenuProps = {
  orderNumber: string
  openMenuLabel: string
  viewDetailLabel: string
}

export function OrdersRowMenu({
  orderNumber,
  openMenuLabel,
  viewDetailLabel,
}: OrdersRowMenuProps) {
  const href = `/orders/${orderNumber}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" className="size-8" />}
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">{openMenuLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={href} />}>
          {viewDetailLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
