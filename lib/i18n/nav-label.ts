/** Map nav href → messages key under `nav.*` */
export function hrefToNavKey(href: string): string {
  const slug = href.replace(/^\//, "").replace(/\//g, ".") || "dashboard"
  const camel = slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return `nav.${camel}`
}

export function translateNavTitle(
  t: (key: string) => string,
  href: string,
  fallback: string
): string {
  const key = hrefToNavKey(href)
  const value = t(key)
  return value === key ? fallback : value
}

/** Map nav group id → `nav.group*` key */
export function translateGroupLabel(
  t: (key: string) => string,
  groupId: string,
  fallback: string
): string {
  const camel = groupId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  const key = `nav.group${camel.charAt(0).toUpperCase()}${camel.slice(1)}`
  const value = t(key)
  return value === key ? fallback : value
}
