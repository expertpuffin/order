const LOCAL_API = "http://localhost:4000"

function trimSlash(url: string | undefined) {
  return url?.replace(/\/$/, "") || undefined
}

/**
 * Base URL for API calls. On the server, API_INTERNAL_URL keeps calls inside the
 * cluster in production (the API then knows they come from this panel, not one
 * shared public IP).
 */
export function apiUrl() {
  const internal = typeof window === "undefined" ? process.env.API_INTERNAL_URL : undefined
  return trimSlash(internal) || trimSlash(process.env.NEXT_PUBLIC_API_URL) || LOCAL_API
}

/** Base URL the browser can reach — for links and media, never the in-cluster host. */
export function publicApiUrl() {
  return trimSlash(process.env.NEXT_PUBLIC_API_URL) || LOCAL_API
}
