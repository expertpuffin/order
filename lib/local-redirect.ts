import { NextResponse } from "next/server"

/**
 * Redirect to a path on this panel with a relative Location header.
 *
 * Why: behind Traefik the standalone server builds request.url from its bind
 * address, so `NextResponse.redirect(new URL(path, request.url))` sent
 * browsers to https://0.0.0.0:3000/… — an unreachable host. A relative
 * Location resolves against the URL the browser actually used.
 */
export function localRedirect(pathWithQuery: string, status = 307) {
  return new NextResponse(null, {
    status,
    headers: { Location: pathWithQuery },
  })
}
