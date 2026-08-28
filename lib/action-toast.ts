"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export type ActionResult =
  | { error: string }
  | { success: boolean; message?: string }
  | null
  | undefined

/**
 * useActionState sonuçlarını toast’a çevirir.
 * Redirect eden action’larda genelde sadece error görünür.
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

/** startTransition / onClick sonuçları için */
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
