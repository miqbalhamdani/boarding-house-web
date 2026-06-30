/** Shape of the `error` object in the API's common error response. */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  fields?: Record<string, string | string[]>;
}

/** Envelope the API returns on failure: `{ "error": { code, message, fields } }`. */
export interface ApiErrorEnvelope {
  error?: ApiErrorBody;
}

/**
 * Normalised error thrown by {@link apiFetch}. Carries the HTTP status, the
 * machine-readable `code`, any per-field validation messages, and a
 * human-readable `message` safe to show to the user.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string | string[]>;

  constructor(status: number, body?: ApiErrorEnvelope | null, fallbackMessage?: string) {
    const err = body?.error;
    super(err?.message || fallbackMessage || "Something went wrong. Please try again.");
    this.name = "ApiError";
    this.status = status;
    this.code = err?.code ?? "UNKNOWN";
    this.fields = err?.fields ?? {};
  }
}

/**
 * Extract per-field error messages from a (possibly non-API) error into a
 * `{ field: message }` map for inline form display. Returns `{}` for anything
 * that isn't an {@link ApiError}.
 */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(error.fields)) {
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out;
}
