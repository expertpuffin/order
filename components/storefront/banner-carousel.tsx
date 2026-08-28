"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { MarketBanner } from "@/lib/api/app-content"
import { cn } from "@/lib/utils"

type BannerCarouselProps = {
  banners: MarketBanner[]
  fallbackTitle: string
  fallbackSubtitle: string
}

const GAP_PX = 12
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=480&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=480&fit=crop",
  "https://images.unsplash.com/photo-1498837167922-ddd27525cd27?w=1200&h=480&fit=crop",
]

function slideImageUrl(slide: MarketBanner, index: number) {
  if (slide.imageUrl) return slide.imageUrl
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
}

function SlideCard({
  slide,
  width,
  imageIndex,
}: {
  slide: MarketBanner
  width: number
  imageIndex: number
}) {
  const [src, setSrc] = useState(() => slideImageUrl(slide, imageIndex))
  const fallback = FALLBACK_IMAGES[imageIndex % FALLBACK_IMAGES.length]

  useEffect(() => {
    setSrc(slideImageUrl(slide, imageIndex))
  }, [slide, imageIndex])

  const card = (
    <div
      className="relative h-[168px] shrink-0 overflow-hidden rounded-2xl sm:h-[200px]"
      style={{ width: width > 0 ? width : "100%" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={slide.title || ""}
        className="absolute inset-0 z-0 size-full object-cover"
        loading={imageIndex < 2 ? "eager" : "lazy"}
        onError={() => {
          if (src !== fallback) setSrc(fallback)
        }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/50 via-black/20 to-black/5" />
      {(slide.title || slide.body || slide.ctaLabel) && (
        <div className="relative z-[2] flex h-full flex-col justify-end p-4 sm:p-5">
          {slide.title ? (
            <p className="text-lg font-bold leading-tight text-white drop-shadow sm:text-xl">
              {slide.title}
            </p>
          ) : null}
          {slide.body ? (
            <p className="mt-1 line-clamp-2 text-sm text-white/90 drop-shadow">
              {slide.body}
            </p>
          ) : null}
          {slide.ctaLabel ? (
            <span className="mt-3 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {slide.ctaLabel}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )

  if (slide.href) {
    return (
      <Link href={slide.href} className="block shrink-0">
        {card}
      </Link>
    )
  }

  return card
}

export function BannerCarousel({
  banners,
  fallbackTitle,
  fallbackSubtitle,
}: BannerCarouselProps) {
  const slides =
    banners.length > 0
      ? banners
      : [
          {
            id: "fallback",
            title: fallbackTitle,
            body: fallbackSubtitle,
            imageUrl: FALLBACK_IMAGES[0],
            ctaLabel: "",
            href: null,
            background: null,
            textColor: null,
          } satisfies MarketBanner,
        ]

  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [index, setIndex] = useState(0)

  const slidesPerView = viewportWidth >= 640 ? 2 : 1
  const slideWidth =
    viewportWidth > 0
      ? (viewportWidth - GAP_PX * (slidesPerView - 1)) / slidesPerView
      : 0
  const maxIndex = Math.max(0, slides.length - slidesPerView)

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(i, maxIndex)),
    [maxIndex]
  )

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const update = () => setViewportWidth(el.clientWidth)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setIndex((i) => clampIndex(i))
  }, [clampIndex, slidesPerView, slides.length])

  useEffect(() => {
    if (slides.length <= slidesPerView) return
    const timer = window.setInterval(() => {
      setIndex((i) => {
        const next = i >= maxIndex ? 0 : i + 1
        return clampIndex(next)
      })
    }, 5500)
    return () => window.clearInterval(timer)
  }, [slides.length, slidesPerView, maxIndex, clampIndex])

  const go = (dir: -1 | 1) => {
    setIndex((i) => clampIndex(i + dir))
  }

  const offset = index * (slideWidth + GAP_PX)

  return (
    <div className="relative">
      <div ref={viewportRef} className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            gap: GAP_PX,
            transform: slideWidth > 0 ? `translateX(-${offset}px)` : undefined,
          }}
        >
          {slides.map((slide, i) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              width={slideWidth}
              imageIndex={i}
            />
          ))}
        </div>
      </div>

      {slides.length > slidesPerView ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index <= 0}
            className="absolute top-1/2 left-2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow disabled:opacity-40 sm:flex"
            aria-label="Previous"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={index >= maxIndex}
            className="absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border bg-white/95 shadow disabled:opacity-40"
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(clampIndex(i))}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i >= index && i < index + slidesPerView
                    ? "bg-[var(--brand-navy)]"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
