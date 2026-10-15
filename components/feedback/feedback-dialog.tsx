"use client"

import * as React from "react"
import { Camera, ImagePlus, Loader2, PenLine, X } from "lucide-react"

import { useI18n } from "@/components/i18n/i18n-provider"
import { MarksOverlay, ScreenshotEditor } from "@/components/feedback/screenshot-editor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  MAX_SHOTS,
  buildFeedbackMeta,
  capturePage,
  exportShots,
  isImageFile,
  shotFromBlob,
  type FeedbackShot,
} from "@/lib/feedback-capture"
import { cn } from "@/lib/utils"

const RATINGS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "🤩" },
] as const

const SUPPORT_EMAIL = "support@ordoria.com"
const PRIVACY_URL = "https://business.ordoria.com/privacy"

type FeedbackContextValue = { openFeedback: () => void }

const FeedbackContext = React.createContext<FeedbackContextValue | null>(null)

/** Opens the panel's feedback dialog (account menus). */
export function useFeedback() {
  const ctx = React.useContext(FeedbackContext)
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider")
  return ctx
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { t, locale } = useI18n()
  const [open, setOpen] = React.useState(false)
  // Hidden while the page is captured, so the dialog isn't in the picture.
  const [hidden, setHidden] = React.useState(false)
  const [rating, setRating] = React.useState<number | null>(null)
  const [message, setMessage] = React.useState("")
  const [shots, setShots] = React.useState<FeedbackShot[]>([])
  const [editing, setEditing] = React.useState<string | null>(null)
  const [capturing, setCapturing] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInput = React.useRef<HTMLInputElement>(null)
  const shotsRef = React.useRef(shots)
  React.useEffect(() => {
    shotsRef.current = shots
  }, [shots])

  const reset = React.useCallback(() => {
    shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url))
    setRating(null)
    setMessage("")
    setShots([])
    setEditing(null)
    setSent(false)
    setError(null)
  }, [])

  React.useEffect(() => () => shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url)), [])

  const close = () => {
    setOpen(false)
    setTimeout(reset, 200)
  }

  const addBlobs = async (blobs: Blob[]) => {
    setError(null)
    const room = MAX_SHOTS - shotsRef.current.length
    if (room <= 0) {
      setError(t("feedback.tooMany"))
      return
    }
    if (blobs.length > room) setError(t("feedback.tooMany"))
    const added: FeedbackShot[] = []
    for (const blob of blobs.slice(0, room)) {
      try {
        added.push(await shotFromBlob(blob))
      } catch {
        setError(t("feedback.notImage"))
      }
    }
    setShots((s) => [...s, ...added].slice(0, MAX_SHOTS))
  }

  const addFiles = (files: File[]) => {
    const images = files.filter(isImageFile)
    if (images.length < files.length) setError(t("feedback.notImage"))
    if (images.length) void addBlobs(images)
  }

  const capture = async () => {
    if (shotsRef.current.length >= MAX_SHOTS) {
      setError(t("feedback.tooMany"))
      return
    }
    setCapturing(true)
    setError(null)
    setHidden(true)
    try {
      await wait(220)
      await nextFrame()
      await nextFrame()
      const blob = await capturePage()
      await addBlobs([blob])
    } catch {
      setError(t("feedback.captureFailed"))
    } finally {
      setHidden(false)
      setCapturing(false)
    }
  }

  const send = async () => {
    if (rating == null || sending) return
    setSending(true)
    setError(null)
    try {
      const blobs = await exportShots(shots)
      const form = new FormData()
      form.set("rating", String(rating))
      // A face alone is fine — the API needs some text, like the app sends.
      form.set("message", message.trim() || (blobs.length ? "" : t("feedback.ratingOnly")))
      form.set("meta", JSON.stringify(buildFeedbackMeta(locale)))
      blobs.forEach((b, i) =>
        form.append("screenshots", b, `screenshot-${i + 1}.${b.type === "image/webp" ? "webp" : "jpg"}`)
      )
      const res = await fetch("/api/feedback", { method: "POST", body: form, credentials: "same-origin" })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(body?.message || t("feedback.sendFailed"))
      }
      setSent(true)
    } catch (e) {
      const msg = (e as Error).message
      setError(msg === "too_large" ? t("feedback.tooLarge") : msg || t("feedback.sendFailed"))
    } finally {
      setSending(false)
    }
  }

  const editingShot = shots.find((s) => s.id === editing) ?? null
  const value = React.useMemo(() => ({ openFeedback: () => setOpen(true) }), [])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Dialog
        open={open && !hidden}
        onOpenChange={(next) => {
          if (!next && !hidden) close()
        }}
      >
        <DialogContent
          data-feedback-exclude
          className={cn("max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg", editingShot && "sm:max-w-4xl")}
          onPaste={(e) => {
            if (sent || editingShot) return
            const files = Array.from(e.clipboardData.files)
            if (files.length) {
              e.preventDefault()
              addFiles(files)
            }
          }}
        >
          {sent ? (
            <div className="grid justify-items-center gap-3 py-6 text-center">
              <span className="text-4xl" aria-hidden>
                🙏
              </span>
              <DialogTitle className="text-lg font-semibold">{t("feedback.thanksTitle")}</DialogTitle>
              <DialogDescription>{t("feedback.thanksBody")}</DialogDescription>
              <Button className="mt-2 min-w-32" onClick={close}>
                {t("feedback.close")}
              </Button>
            </div>
          ) : editingShot ? (
            <>
              <DialogHeader>
                <DialogTitle>{t("feedback.editor.title")}</DialogTitle>
              </DialogHeader>
              <ScreenshotEditor
                shot={editingShot}
                onCancel={() => setEditing(null)}
                onDone={(marks) => {
                  setShots((all) => all.map((s) => (s.id === editingShot.id ? { ...s, marks } : s)))
                  setEditing(null)
                }}
              />
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">{t("feedback.title")}</DialogTitle>
                <DialogDescription>{t("feedback.subtitle")}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <p id="feedback-rating" className="text-sm font-medium">
                  {t("feedback.ratingLabel")}
                </p>
                <div role="radiogroup" aria-labelledby="feedback-rating" className="flex justify-between px-1">
                  {RATINGS.map((r) => {
                    const active = rating === r.value
                    return (
                      <button
                        key={r.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={t(`feedback.ratings.${r.value}`)}
                        title={t(`feedback.ratings.${r.value}`)}
                        onClick={() => setRating(r.value)}
                        className={cn(
                          "grid size-12 place-items-center rounded-full text-[28px] leading-none transition-[transform,opacity,background-color] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:hover:scale-110",
                          active && "bg-yellow-400 motion-safe:scale-110",
                          rating != null && !active && "opacity-40"
                        )}
                      >
                        <span aria-hidden>{r.emoji}</span>
                      </button>
                    )
                  })}
                </div>
                {rating == null ? (
                  <p className="text-center text-xs text-muted-foreground">{t("feedback.pickRating")}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label htmlFor="feedback-message" className="text-sm font-medium">
                  {t("feedback.messageLabel")}
                </label>
                <Textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("feedback.messagePlaceholder")}
                  maxLength={4000}
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">{t("feedback.screenshots")}</p>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {shots.length}/{MAX_SHOTS}
                  </span>
                </div>

                {shots.length ? (
                  <ul className="grid grid-cols-3 gap-2">
                    {shots.map((shot, i) => (
                      <li key={shot.id} className="group relative overflow-hidden rounded-lg border bg-muted/40">
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                          <img
                            src={shot.url}
                            alt={t("feedback.shotAlt", { n: i + 1 })}
                            className="block aspect-video w-full object-cover object-top"
                          />
                          <MarksOverlay shot={shot} marks={shot.marks} />
                        </div>
                        <div className="flex items-center justify-between gap-1 border-t bg-background/90 p-1">
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            onClick={() => setEditing(shot.id)}
                          >
                            <PenLine />
                            {shot.marks.length
                              ? t("feedback.marks", { count: shot.marks.length })
                              : t("feedback.edit")}
                          </Button>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            aria-label={t("feedback.remove")}
                            onClick={() => {
                              URL.revokeObjectURL(shot.url)
                              setShots((all) => all.filter((s) => s.id !== shot.id))
                            }}
                          >
                            <X />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {shots.length < MAX_SHOTS ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragging(true)
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragging(false)
                      addFiles(Array.from(e.dataTransfer.files))
                    }}
                    className={cn(
                      "grid gap-2 rounded-lg border border-dashed p-3 transition-colors",
                      dragging && "border-orange-500 bg-orange-500/5"
                    )}
                  >
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" disabled={capturing} onClick={() => void capture()}>
                        {capturing ? <Loader2 className="animate-spin" /> : <Camera />}
                        {capturing ? t("feedback.capturing") : t("feedback.capture")}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
                        <ImagePlus />
                        {t("feedback.upload")}
                      </Button>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        multiple
                        hidden
                        onChange={(e) => {
                          addFiles(Array.from(e.target.files ?? []))
                          e.target.value = ""
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t("feedback.screenshotsHint")}</p>
                  </div>
                ) : null}

                {shots.length ? (
                  <p className="rounded-lg bg-muted/60 p-2.5 text-xs leading-relaxed text-muted-foreground">
                    {t("feedback.privacy")}{" "}
                    <a
                      href={PRIVACY_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline underline-offset-2"
                    >
                      {t("feedback.privacyLink")}
                    </a>
                  </p>
                ) : null}
              </div>

              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {t("feedback.urgent")}{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-foreground underline underline-offset-2">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
                <Button type="button" disabled={rating == null || sending} onClick={() => void send()}>
                  {sending ? <Loader2 className="animate-spin" /> : null}
                  {sending ? t("feedback.sending") : t("feedback.send")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </FeedbackContext.Provider>
  )
}
