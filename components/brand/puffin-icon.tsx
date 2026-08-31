import { cn } from "@/lib/utils"

export const PUFFIN_ICONS = {
  emptyCart: "puffin-mascot-holding-empty",
  emptyFavourites: "puffin-mascot-holding-star",
  emptyOrders: "puffin-mascot-weighing-parcel",
  help: "puffin-mascot-holding-question",
  accessDenied: "puffin-mascot-standing-guard",
  welcome: "puffin-mascot-holding-welcome",
} as const

export type PuffinIconName = (typeof PUFFIN_ICONS)[keyof typeof PUFFIN_ICONS]

type PuffinIconProps = {
  name: PuffinIconName
  className?: string
  /** Accessible label — decorative when omitted */
  label?: string
}

/**
 * Koboyo hand-drawn puffin SVGs (fill=currentColor).
 * Coloured via `text-*` / `bg` mask so brand navy works without editing the SVG.
 */
export function PuffinIcon({ name, className, label }: PuffinIconProps) {
  const src = `/icons/puffin/${name}.svg`
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block shrink-0 bg-current text-[var(--brand-navy)]",
        className
      )}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  )
}
