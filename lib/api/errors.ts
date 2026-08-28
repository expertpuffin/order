export class ApiError extends Error {
  status: number
  errors?: string[]

  constructor(message: string, status = 500, errors?: string[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}
