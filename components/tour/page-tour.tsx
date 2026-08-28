"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type Step,
} from "react-joyride"

import { TourTooltip } from "@/components/tour/tour-tooltip"
import {
  filterVisibleTourStepDefs,
  hasCompletedTour,
  type TourStepDef,
} from "@/lib/product-tour"
import {
  hasCompletedPageTour,
  markPageTourCompleted,
  normalizeTourPath,
  resolvePageTourSteps,
} from "@/lib/page-tours"

function defsToSteps(defs: TourStepDef[]): Step[] {
  return defs.map((def) => ({
    target: def.target,
    placement: def.placement ?? "bottom",
    title: def.title,
    content: def.body,
    data: {
      eyebrow: def.eyebrow,
      body: def.body,
      tips: def.tips,
    },
    skipBeacon: true,
    disableFocusTrap: false,
  }))
}

/**
 * First-visit tour for the current page body (not sidebar).
 * Waits until the global nav tour is finished/skipped.
 */
export function PageTour() {
  const pathname = usePathname()
  const path = normalizeTourPath(pathname)
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [activePath, setActivePath] = useState<string | null>(null)

  useEffect(() => {
    setRun(false)
    setSteps([])
    setActivePath(null)

    // Don’t overlap with the global sidebar tour
    if (!hasCompletedTour()) return
    if (hasCompletedPageTour(path)) return

    const defs = resolvePageTourSteps(path)
    if (!defs?.length) return

    const id = window.setTimeout(() => {
      const visible = filterVisibleTourStepDefs(defs)
      if (visible.length === 0) {
        // Targets not ready yet — retry once after layout paints
        window.setTimeout(() => {
          const retry = filterVisibleTourStepDefs(defs)
          if (retry.length === 0) return
          setActivePath(path)
          setSteps(defsToSteps(retry))
          setRun(true)
        }, 500)
        return
      }
      setActivePath(path)
      setSteps(defsToSteps(visible))
      setRun(true)
    }, 550)

    return () => window.clearTimeout(id)
  }, [path])

  const onEvent = useCallback(
    (data: EventData) => {
      const { status, type } = data
      if (
        type === EVENTS.TOUR_END ||
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED
      ) {
        if (activePath) markPageTourCompleted(activePath)
        setRun(false)
      }
    },
    [activePath]
  )

  const locale = useMemo(
    () => ({
      back: "Back",
      close: "Close",
      last: "Done",
      next: "Next",
      skip: "Skip",
      nextWithProgress: "Next ({current} of {total})",
    }),
    []
  )

  if (steps.length === 0) return null

  return (
    <Joyride
      continuous
      run={run}
      steps={steps}
      scrollToFirstStep
      onEvent={onEvent}
      locale={locale}
      tooltipComponent={TourTooltip}
      options={{
        buttons: ["back", "skip", "primary"],
        skipBeacon: true,
        showProgress: true,
        closeButtonAction: "skip",
        overlayClickAction: false,
        primaryColor: "var(--primary)",
        backgroundColor: "var(--popover)",
        textColor: "var(--popover-foreground)",
        arrowColor: "var(--popover)",
        overlayColor: "rgba(15, 23, 42, 0.5)",
        spotlightRadius: 12,
        spotlightPadding: 10,
        width: 400,
        zIndex: 10000,
      }}
    />
  )
}
