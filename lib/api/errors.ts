export class ApiError extends Error {
  status: number
  errors?: string[]
  /** Backend machine code, e.g. APPROVAL_CHANGED */
  code?: string

  constructor(message: string, status = 500, errors?: string[], code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
    this.code = code
  }
}
