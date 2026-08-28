/** Client-side CSV export for table download buttons */

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function rowsToCsv(rows: string[][]): string {
  return (
    "\uFEFF" +
    rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\r\n")
  )
}

export function downloadCsv(filename: string, rows: string[][]) {
  const blob = new Blob([rowsToCsv(rows)], {
    type: "text/csv;charset=utf-8",
  })
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, blob)
}

function cellText(node: Element | null): string {
  if (!node) return ""
  return (node.textContent || "").replace(/\s+/g, " ").trim()
}

export function tableToRows(table: HTMLTableElement): string[][] {
  const rows: string[][] = []
  table.querySelectorAll("tr").forEach((tr) => {
    const cells = tr.querySelectorAll("th, td")
    if (!cells.length) return
    rows.push(Array.from(cells).map((cell) => cellText(cell)))
  })
  return rows
}

export function exportTableElement(
  table: HTMLTableElement,
  filename: string
): boolean {
  const rows = tableToRows(table)
  if (rows.length === 0) return false
  downloadCsv(filename, rows)
  return true
}
