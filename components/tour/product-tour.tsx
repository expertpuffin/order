"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  EVENTS,
  Joyride,
  STATUS,
  type EventData,
  type Step,
} from "react-joyride"

import { TourTooltip } from "@/components/tour/tour-tooltip"
import { useSidebar } from "@/components/ui/sidebar"
import {
  ALL_TOUR_STEP_DEFS,
  filterVisibleTourStepDefs,
  hasCompletedTour,
  markTourCompleted,
  type TourStepDef,
} from "@/lib/product-tour"

function defsToSteps(defs: TourStepDef[]): Step[] {
  return defs.map((def) => ({
    target: def.target,
    placement: def.placement ?? "right",
    title: def.title,
    content: def.body,
    data: {
      eyebrow: def.eyebrow,
      body: def.body,
      tips: def.tips,
    },
    skipBeacon: true,
    disableFocusTrap: def.placement === "center",
    isFixed: def.placement === "center",
  }))
}

export function ProductTour() {
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const { setOpen, setOpenMobile, isMobile } = useSidebar()

  useEffect(() => {
    if (hasCompletedTour()) return
    const id = window.setTimeout(() => {
      if (isMobile) setOpenMobile(true)
      else setOpen(true)

      window.setTimeout(() => {
        const visible = filterVisibleTourStepDefs(ALL_TOUR_STEP_DEFS)
        if (visible.length === 0) return
        setSteps(defsToSteps(visible))
        setRun(true)
      }, 280)
    }, 450)
    return () => window.clearTimeout(id)
  }, [isMobile, setOpen, setOpenMobile])

  const onEvent = useCallback((data: EventData) => {
    const { status, type } = data
    if (
      type === EVENTS.TOUR_END ||
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED
    ) {
      markTourCompleted()
      setRun(false)
    }
  }, [])

  const locale = useMemo(
    () => ({
      back: "Back",
      close: "Close",
      last: "Done",
      next: "Next",
      skip: "Skip tour",
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
        overlayColor: "rgba(15, 23, 42, 0.55)",
        spotlightRadius: 10,
        spotlightPadding: 8,
        width: 400,
        zIndex: 10000,
      }}
    />
  )
}
