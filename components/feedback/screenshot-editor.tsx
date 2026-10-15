"use client"

import * as React from "react"
import { EyeOff, Square, Undo2 } from "lucide-react"

import { useT } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import type { FeedbackMark, FeedbackShot } from "@/lib/feedback-capture"
import { cn } from "@/lib/utils"

/** The marks as boxes over the image, in % so they scale with it. */
export function MarksOverlay({ shot, marks }: { shot: FeedbackShot; marks: FeedbackMark[] }) {
  return (
    <>
      {marks.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "pointer-events-none absolute",
            m.kind === "redact" ? "bg-black" : "rounded-[2px] border-[3px] border-red-500"
          )}
          style={{
            left: `${(m.x / shot.width) * 100}%`,
            top: `${(m.y / shot.height) * 100}%`,
            width: `${(m.w / shot.width) * 100}%`,
            height: `${(m.h / shot.height) * 100}%`,
          }}
        />
      ))}
    </>
  )
}

type Props = {
  shot: FeedbackShot
  onDone: (marks: FeedbackMark[]) => void
  onCancel: () => void
}

/** Drag on the screenshot: Highlight frames something, Hide blacks it out. */
export function ScreenshotEditor({ shot, onDone, onCancel }: Props) {
  const t = useT()
  const [tool, setTool] = React.useState<FeedbackMark["kind"]>("highlight")
  const [marks, setMarks] = React.useState<FeedbackMark[]>(shot.marks)
  const [draft, setDraft] = React.useState<FeedbackMark | null>(null)
  const start = React.useRef<{ x: number; y: number } | null>(null)
  const box = React.useRef<HTMLDivElement>(null)

  const toImage = (e: React.PointerEvent) => {
    const rect = box.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * shot.width
    const y = ((e.clientY - rect.top) / rect.height) * shot.height
    return {
      x: Math.max(0, Math.min(shot.width, x)),
      y: Math.max(0, Math.min(shot.height, y)),
    }
  }

  const fromStart = (p: { x: number; y: number }): FeedbackMark => {
    const s = start.current!
    return {
      kind: tool,
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={t("feedback.editor.title")} className="flex gap-1 rounded-lg bg-muted p-1">
          {(
            [
              ["highlight", Square, t("feedback.editor.highlight")],
              ["redact", EyeOff, t("feedback.editor.redact")],
            ] as const
          ).map(([kind, Icon, label]) => (
            <Button
              key={kind}
              type="button"
              role="radio"
              aria-checked={tool === kind}
              size="sm"
              variant={tool === kind ? "default" : "ghost"}
              onClick={() => setTool(kind)}
            >
              <Icon className={cn(kind === "highlight" && tool !== kind && "text-red-500")} />
              {label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!marks.length}
          onClick={() => setMarks((m) => m.slice(0, -1))}
        >
          <Undo2 />
          {t("feedback.editor.undo")}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={!marks.length} onClick={() => setMarks([])}>
          {t("feedback.editor.clear")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{t("feedback.editor.hint")}</p>

      <div className="max-h-[60vh] overflow-auto rounded-lg border bg-muted/40">
        <div
          ref={box}
          className="relative mx-auto w-fit cursor-crosshair touch-none select-none"
          onPointerDown={(e) => {
            if (e.button !== 0) return
            e.currentTarget.setPointerCapture(e.pointerId)
            start.current = toImage(e)
            setDraft(null)
          }}
          onPointerMove={(e) => {
            if (!start.current) return
            setDraft(fromStart(toImage(e)))
          }}
          onPointerUp={(e) => {
            if (!start.current) return
            const mark = fromStart(toImage(e))
            start.current = null
            setDraft(null)
            // Ignore clicks — a box needs a little size (in image pixels).
            const min = Math.max(6, shot.width / 200)
            if (mark.w >= min && mark.h >= min) setMarks((m) => [...m, mark])
          }}
          onPointerCancel={() => {
            start.current = null
            setDraft(null)
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
          <img src={shot.url} alt="" draggable={false} className="block max-h-[58vh] w-auto max-w-full" />
          <MarksOverlay shot={shot} marks={draft ? [...marks, draft] : marks} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="button" onClick={() => onDone(marks)}>
          {t("feedback.editor.done")}
        </Button>
      </div>
    </div>
  )
}
