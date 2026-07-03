export type AuthKind = "owner" | "tenant"

export type TokenPair = {
  access_token: string
  refresh_token: string
}

export type ApiSuccess<T> = {
  data: T
  message?: string
}

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

// Thrown by apiFetch for any non-2xx response or transport failure.
// Carries the backend error envelope so UI can show code/message and
// map field-level messages onto form inputs.
export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string>

  constructor(
    status: number,
    code: string,
    message: string,
    fields: Record<string, string> = {}
  ) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.code = code
    this.fields = fields
  }
}
