"use client"

import { useState, useTransition } from "react"
import { Minus, Plus } from "lucide-react"

import {
  clearCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/lib/actions"
import { notifyActionResult } from "@/lib/action-toast"
import { useT } from "@/components/i18n/i18n-provider"
import type { CartLine } from "@/lib/api/cart"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CartEditorProps = {
  businessId: string
  lines: CartLine[]
}

type PendingRemove = {
  line: CartLine
}

export function CartEditor({ businessId, lines }: CartEditorProps) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [comments, setComments] = useState<Record<string, string>>(() =>
    Object.fromEntries(lines.map((line) => [line.id, line.comment ?? ""]))
  )
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)

  const bumpQty = (line: CartLine, delta: number) => {
    if (delta < 0 && line.quantity <= 1) {
      setPendingRemove({ line })
      return
    }
    const next = line.quantity + delta
    startTransition(async () => {
      notifyActionResult(
        await updateCartItemAction(businessId, line.id, {
          quantity: Math.max(1, next),
        }),
        t("storefront.updated")
      )
    })
  }

  const confirmRemove = () => {
    if (!pendingRemove) return
    const { line } = pendingRemove
    setPendingRemove(null)
    startTransition(async () => {
      notifyActionResult(
        await removeCartItemAction(businessId, line.id),
        t("storefront.removed")
      )
    })
  }

  return (
    <>
      <ul className="divide-y divide-[var(--sidebar-border)]">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start"
          >
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] bg-[#f3f4f6]">
                {line.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                    {line.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-[var(--brand-navy)]">
                    {line.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {[line.brand, line.packSize].filter(Boolean).join(" · ") ||
                      "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Select
                    value={line.unit}
                    onValueChange={(unit) =>
                      startTransition(async () => {
                        notifyActionResult(
                          await updateCartItemAction(businessId, line.id, {
                            unit: unit ?? line.unit,
                          }),
                          t("storefront.updated")
                        )
                      })
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      className="h-9 w-[92px] rounded-[2px] border-[var(--sidebar-border)]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[2px]">
                      {(line.packagingOptions.length
                        ? line.packagingOptions
                        : [line.unit]
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="inline-flex overflow-hidden rounded-[2px] border border-[var(--sidebar-border)]">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="size-8 rounded-none"
                      disabled={pending}
                      onClick={() => bumpQty(line, -1)}
                      aria-label={t("cart.decreaseQty")}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="flex min-w-8 items-center justify-center border-x border-[var(--sidebar-border)] text-sm font-semibold tabular-nums text-[var(--brand-navy)]">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="size-8 rounded-none"
                      disabled={pending}
                      onClick={() => bumpQty(line, 1)}
                      aria-label={t("cart.increaseQty")}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <Input
                  value={comments[line.id] ?? ""}
                  onChange={(e) =>
                    setComments((c) => ({ ...c, [line.id]: e.target.value }))
                  }
                  placeholder={t("cart.lineNotePlaceholder")}
                  className="h-9 rounded-[2px] border-[var(--sidebar-border)] text-sm focus-visible:border-[var(--brand-navy)] focus-visible:ring-1 focus-visible:ring-[var(--brand-navy)]"
                  disabled={pending}
                  onBlur={() =>
                    startTransition(async () => {
                      notifyActionResult(
                        await updateCartItemAction(businessId, line.id, {
                          comment: (comments[line.id] || null) ?? undefined,
                        }),
                        t("storefront.updated")
                      )
                    })
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-[var(--sidebar-border)] pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          className="rounded-[2px] border-[var(--sidebar-border)] text-[var(--brand-navy)]"
          onClick={() => {
            if (!window.confirm(t("cart.clearConfirm"))) return
            startTransition(async () => {
              notifyActionResult(
                await clearCartAction(businessId),
                t("cart.cleared")
              )
            })
          }}
        >
          {t("cart.clearCart")}
        </Button>
      </div>

      <Dialog
        open={pendingRemove != null}
        onOpenChange={(open) => {
          if (!open) setPendingRemove(null)
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden rounded-[2px] border border-[var(--sidebar-border)] p-0 ring-0 sm:max-w-md"
        >
          <DialogHeader className="space-y-1 border-b border-[var(--sidebar-border)] px-5 py-4 text-left">
            <DialogTitle className="text-[15px] font-semibold tracking-tight text-[var(--brand-navy)]">
              {t("cart.removeTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("cart.removeBody", {
                name: pendingRemove?.line.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 px-5 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-[2px] border-[var(--sidebar-border)]"
              onClick={() => setPendingRemove(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-[2px]"
              disabled={pending}
              onClick={confirmRemove}
            >
              {t("cart.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
