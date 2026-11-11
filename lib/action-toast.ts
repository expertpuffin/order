"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import type { ActionResult as ServerActionResult } from "@/lib/actions/result"

type ActionResult = ServerActionResult<{ message?: string }> | null | undefined

/**
 * Turns useActionState results into toasts. Actions that redirect only ever
 * come back with an error.
 */
export function useActionToast(
  state: ActionResult,
  opts?: { successMessage?: string; showSuccess?: boolean }
) {
  useEffect(() => {
    if (!state) return
    if ("error" in state && state.error) {
      toast.error(state.error)
      return
    }
    if (
      opts?.showSuccess !== false &&
      "success" in state &&
      state.success
    ) {
      toast.success(state.message ?? opts?.successMessage ?? "Saved")
    }
  }, [state, opts?.successMessage, opts?.showSuccess])
}

export function notifyActionResult(
  result: ActionResult | void,
  successMessage = "Saved"
): boolean {
  if (result && "error" in result && result.error) {
    toast.error(result.error)
    return false
  }
  toast.success(successMessage)
  return true
}
