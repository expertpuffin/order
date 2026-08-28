"use client"

import { useRef, useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { exportTableElement } from "@/lib/export-csv"
import { cn } from "@/lib/utils"

type ExportTableButtonProps = {
  filename?: string
  label?: string
  variant?: "outline" | "ghost" | "secondary" | "default"
  size?: "sm" | "default" | "xs"
  className?: string
  tableSelector?: string
}

export function ExportTableButton({
  filename = "export",
  label,
  variant = "outline",
  size = "sm",
  className,
  tableSelector = "table",
}: ExportTableButtonProps) {
  const t = useT()
  const resolvedLabel = label ?? t("common.export")
  const wrapRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  async function run() {
    if (busy) return
    const root =
      wrapRef.current?.closest("[data-export-root]") ||
      wrapRef.current?.closest("[data-slot=card]") ||
      wrapRef.current?.closest("section") ||
      document.body
    const table = root.querySelector(tableSelector)
    if (!table) {
      toast.error(t("common.noTableExport"))
      return
    }
    setBusy(true)
    try {
      const stamp = new Date().toISOString().slice(0, 10)
      const ok = exportTableElement(
        table as HTMLTableElement,
        `${filename}-${stamp}`
      )
      if (ok) {
        toast.success(t("common.csvDownloaded"))
      } else {
        toast.error(t("common.nothingToExport"))
      }
    } catch {
      toast.error(t("common.exportFailed"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <Button
        variant={variant}
        size={size}
        type="button"
        className={cn(className)}
        disabled={busy}
        onClick={() => void run()}
      >
        <Download className="size-3.5" />
        {busy ? t("common.exporting") : resolvedLabel}
      </Button>
    </div>
  )
}
