"use client"

import { useRef, useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { exportTableElement } from "@/lib/export-csv"

/** Downloads the table inside the nearest `[data-export-root]` as CSV. */
export function ExportTableButton({ filename }: { filename: string }) {
  const t = useT()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  async function run() {
    if (busy) return
    const table = wrapRef.current?.closest("[data-export-root]")?.querySelector("table")
    if (!table) {
      toast.error(t("common.noTableExport"))
      return
    }
    setBusy(true)
    try {
      const stamp = new Date().toISOString().slice(0, 10)
      if (exportTableElement(table, `${filename}-${stamp}`)) toast.success(t("common.csvDownloaded"))
      else toast.error(t("common.nothingToExport"))
    } catch {
      toast.error(t("common.exportFailed"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <Button variant="outline" size="sm" type="button" disabled={busy} onClick={() => void run()}>
        <Download className="size-3.5" />
        {busy ? t("common.exporting") : t("common.export")}
      </Button>
    </div>
  )
}
