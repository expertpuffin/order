/** Client-safe URL helpers — do not import server API modules here. */

export function productPagePath(itemCode: string): string {
  return `/products/${encodeURIComponent(itemCode.trim().toLowerCase())}`
}
