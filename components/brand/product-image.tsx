import { cn } from "@/lib/utils"

/**
 * A product photo filling its frame, or the product's initials when it has none.
 * Plain <img>: images come from the CMS on any host, outside next/image's config.
 */
export function ProductImage({
  src,
  name,
  alt = "",
  fit = "cover",
  initials = 1,
  className,
}: {
  src: string | null | undefined
  name: string
  alt?: string
  fit?: "cover" | "contain"
  initials?: 1 | 2
  /** Size of the initials fallback, e.g. "text-sm" */
  className?: string
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={fit === "cover" ? "size-full object-cover" : "max-h-full max-w-full object-contain"}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn("flex size-full items-center justify-center font-semibold uppercase text-muted-foreground", className)}
    >
      {name.slice(0, initials)}
    </span>
  )
}
