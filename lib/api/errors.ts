import { ApiClientError } from "@/lib/api/types"

// Human-readable message for a caught request error, for toasts. Uses the
// backend-provided message when available, otherwise a generic fallback.
export function errorMessage(error: unknown): string {
  return error instanceof ApiClientError
    ? error.message
    : "Something went wrong. Please try again."
}
