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
      <ul className="divide-y">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl border bg-muted/40">
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
                  <p className="font-medium text-[var(--brand-navy)]">{line.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[line.brand, line.packSize].filter(Boolean).join(" · ") || "—"}
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
                    <SelectTrigger size="sm" className="h-9 w-[92px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-0.5">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="size-8 rounded-md"
                      disabled={pending}
                      onClick={() => bumpQty(line, -1)}
                      aria-label={t("cart.decreaseQty")}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="size-8 rounded-md"
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
                  className="h-9 rounded-lg text-sm"
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

      <div className="mt-4 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          className="rounded-lg"
          onClick={() => {
            if (!window.confirm(t("cart.clearConfirm"))) return
            startTransition(async () => {
              notifyActionResult(await clearCartAction(businessId), t("cart.cleared"))
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
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("cart.removeTitle")}</DialogTitle>
            <DialogDescription>
              {t("cart.removeBody", {
                name: pendingRemove?.line.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingRemove(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" variant="destructive" disabled={pending} onClick={confirmRemove}>
              {t("cart.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
