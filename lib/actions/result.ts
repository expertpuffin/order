import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/backend/errors"
import { getTranslator } from "@/lib/i18n"
import type { TranslateValues } from "@/lib/i18n"

/** What every server action returns to the client: success with extras, or an error to show. */
export type ActionResult<T extends object = object> =
  | ({ success: true } & T)
  | { error: string; code?: string | null; details?: Record<string, unknown> }

export type ActionError = Extract<ActionResult, { error: string }>

/** An error in the visitor's language (messages key), for checks the panel makes itself. */
export async function failure(key: string, values?: TranslateValues): Promise<ActionError> {
  const { t } = await getTranslator()
  return { error: t(key, values) }
}

/** An API error passes on the backend's message and code; anything else is a generic, translated error. */
export async function actionError(error: unknown): Promise<ActionError> {
  if (error instanceof ApiError) return { error: error.message, code: error.code ?? null }
  return failure("errors.generic")
}

export function formString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

/**
 * Cart, order and business changes show up on every page: the header carries the
 * cart count and the active business. Revalidate the whole tree, not a list of
 * paths that has to grow with every page.
 */
export function refreshAllPages() {
  revalidatePath("/", "layout")
}
