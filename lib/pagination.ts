/** A page of a backend list (orders, products). */
export type Pagination = { page: number; limit: number; total: number; pages: number }

/** Links to the neighbouring pages, built with the list's own URL schema. */
export function pageLinks(pagination: Pagination, hrefFor: (page: number) => string) {
  const { page, pages } = pagination
  return {
    prevHref: page > 1 ? hrefFor(page - 1) : null,
    nextHref: page < pages ? hrefFor(page + 1) : null,
  }
}
