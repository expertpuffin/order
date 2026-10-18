export class ApiError extends Error {
  status: number
  errors?: string[]
  /** Backend machine code, e.g. APPROVAL_CHANGED */
  code?: string
  /** Backend extras, e.g. the 3D Secure step for PAYMENT_ACTION_REQUIRED */
  details?: Record<string, unknown>

  constructor(
    message: string,
    status = 500,
    errors?: string[],
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
    this.code = code
    this.details = details
  }
}
