export function getApiBaseUrl() {
  // On the server, API_INTERNAL_URL keeps calls inside the cluster in production
  // (the API then knows they come from this panel, not one shared public IP).
  const internal =
    typeof window === "undefined" ? process.env.API_INTERNAL_URL : undefined
  return (
    (internal || process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "") ||
    "http://localhost:4000"
  )
}
