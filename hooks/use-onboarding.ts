"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import type { AssignRoomInput } from "@/lib/onboarding/schemas"
import {
  assignRoom,
  cancelOnboarding,
  type AssignRoomResult,
} from "@/services/onboarding"

// Retry only transient failures (network / 5xx) once. Auth (401/403) and
// conflict/validation (400/404/409) errors won't fix themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

// Assigning a tenant to a room touches rooms (→ reserved) and tenants
// (→ pending_payment) and creates the first bill, so all three caches are
// invalidated. `onSuccess` lets the page swap to its in-place success panel
// instead of navigating away.
export function useAssignRoom(options?: {
  onSuccess?: (result: AssignRoomResult) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AssignRoomInput) => assignRoom(input),
    retry: retryTransient,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      queryClient.invalidateQueries({ queryKey: ["onboarding"] })
      toast.success("Tenant assigned")
      options?.onSuccess?.(result)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

// Cancelling releases the room back to available and cancels the first bill, so
// the same three caches are invalidated.
export function useCancelOnboarding(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomAssignmentId: string) =>
      cancelOnboarding(roomAssignmentId),
    retry: retryTransient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] })
      queryClient.invalidateQueries({ queryKey: ["tenants"] })
      queryClient.invalidateQueries({ queryKey: ["onboarding"] })
      toast.success("Onboarding cancelled")
      options?.onSuccess?.()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
