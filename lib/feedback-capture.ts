"use client"

/** One screenshot in the feedback dialog, with the boxes drawn on it. */
export type FeedbackMark = {
  kind: "highlight" | "redact"
  /** Image pixels. */
  x: number
  y: number
  w: number
  h: number
}

export type FeedbackShot = {
  id: string
  /** Object URL of the untouched image. */
  url: string
  width: number
  height: number
  marks: FeedbackMark[]
}

export const MAX_SHOTS = 3
/** Longest side sent; panel text stays readable, uploads stay small. */
const MAX_SIDE = 2000
/** Server-side request limit is 4.5 MB for all files together. */
const MAX_TOTAL_BYTES = 3.6 * 1024 * 1024

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"]

export const isImageFile = (file: File) =>
  ACCEPTED.includes(file.type) || /\.(png|jpe?g|webp|gif)$/i.test(file.name)

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Image could not be read"))
    img.src = url
  })
}

export async function shotFromBlob(blob: Blob): Promise<FeedbackShot> {
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    return {
      id: crypto.randomUUID(),
      url,
      width: img.naturalWidth,
      height: img.naturalHeight,
      marks: [],
    }
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

/**
 * The part of the page the user is looking at, as a PNG. The dialog must be
 * hidden first; anything marked `data-feedback-exclude` is left out.
 * Images from other sites that refuse to be read come out as grey boxes.
 */
export async function capturePage(): Promise<Blob> {
  const { domToCanvas } = await import("modern-screenshot")
  const root = document.body
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = await domToCanvas(root, {
    scale,
    backgroundColor: getComputedStyle(root).backgroundColor || "#ffffff",
    timeout: 15000,
    filter: (node) =>
      !(node instanceof Element && node.hasAttribute("data-feedback-exclude")),
    fetch: {
      placeholderImage:
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="#d4d4d8"/></svg>'
        ),
    },
  })

  // Crop the full render to the visible viewport.
  const view = document.createElement("canvas")
  const vw = Math.round(window.innerWidth * scale)
  const vh = Math.round(window.innerHeight * scale)
  view.width = Math.min(vw, canvas.width)
  view.height = Math.min(vh, canvas.height)
  const ctx = view.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")
  const sx = Math.min(Math.round(window.scrollX * scale), Math.max(0, canvas.width - view.width))
  const sy = Math.min(Math.round(window.scrollY * scale), Math.max(0, canvas.height - view.height))
  ctx.drawImage(canvas, sx, sy, view.width, view.height, 0, 0, view.width, view.height)
  return canvasToBlob(view, "image/png")
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image could not be saved"))),
      type,
      quality
    )
  })
}

/** Draws the marks: orange-red frame to point at something, solid black to hide it. */
export function drawMarks(ctx: CanvasRenderingContext2D, marks: FeedbackMark[], ratio = 1) {
  for (const m of marks) {
    const x = m.x * ratio
    const y = m.y * ratio
    const w = m.w * ratio
    const h = m.h * ratio
    if (m.kind === "redact") {
      ctx.fillStyle = "#000"
      ctx.fillRect(x, y, w, h)
    } else {
      const line = Math.max(3, Math.round(4 * ratio))
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = line
      ctx.strokeRect(x, y, w, h)
    }
  }
}

/** Final image: scaled down, marks burnt in, JPEG/WebP so it stays small. */
async function exportShot(shot: FeedbackShot, quality: number): Promise<Blob> {
  const img = await loadImage(shot.url)
  const ratio = Math.min(1, MAX_SIDE / Math.max(shot.width, shot.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(shot.width * ratio)
  canvas.height = Math.round(shot.height * ratio)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  drawMarks(ctx, shot.marks, ratio)
  const webp = await canvasToBlob(canvas, "image/webp", quality)
  // Safari can't encode WebP and hands back a PNG — use JPEG there.
  return webp.type === "image/webp" ? webp : canvasToBlob(canvas, "image/jpeg", quality)
}

export async function exportShots(shots: FeedbackShot[]): Promise<Blob[]> {
  for (const quality of [0.85, 0.7, 0.5]) {
    const blobs = await Promise.all(shots.map((s) => exportShot(s, quality)))
    const total = blobs.reduce((sum, b) => sum + b.size, 0)
    if (total <= MAX_TOTAL_BYTES) return blobs
  }
  throw new Error("too_large")
}

function browserLabel(ua: string) {
  const pick = (re: RegExp, name: string) => {
    const m = ua.match(re)
    return m ? `${name} ${m[1]}` : null
  }
  const browser =
    pick(/Edg\/(\d+)/, "Edge") ||
    pick(/OPR\/(\d+)/, "Opera") ||
    pick(/Firefox\/(\d+)/, "Firefox") ||
    pick(/Chrome\/(\d+)/, "Chrome") ||
    pick(/Version\/(\d+)[\d.]* .*Safari/, "Safari") ||
    "Browser"
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Android/.test(ua)
          ? "Android"
          : /Linux/.test(ua)
            ? "Linux"
            : null
  return [browser, os].filter(Boolean).join(" · ")
}

/** Context attached to every feedback so staff can find the page. */
export function buildFeedbackMeta(locale: string) {
  const ua = navigator.userAgent
  return {
    url: window.location.href,
    route: window.location.pathname,
    pageTitle: document.title,
    browser: browserLabel(ua),
    userAgent: ua,
    platform: "web",
    locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    clientSubmittedAt: new Date().toISOString(),
  }
}
