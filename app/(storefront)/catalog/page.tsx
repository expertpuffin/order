import { redirect } from "next/navigation"

type CatalogRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CatalogRedirect({
  searchParams,
}: CatalogRedirectProps) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) qs.set(key, value)
  }
  const query = qs.toString()
  redirect(query ? `/?${query}` : "/")
}
