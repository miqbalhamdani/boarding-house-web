"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import type { RecordManualPaymentInput } from "@/lib/payments/schemas"
import {
  getPayment,
  listPayments,
  recordManualPayment,
  type Payment,
  type PaymentListParams,
} from "@/services/payments"

const PAYMENTS_KEY = ["payments"] as const
const BILLS_KEY = ["bills"] as const

// Retry only transient failures (network / 5xx) once. Auth (401/403),
// validation (400), not-found (404) and conflict (409) errors won't fix
// themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "list", params],
    queryFn: () => listPayments(params),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "detail", id],
    queryFn: () => getPayment(id),
    enabled: Boolean(id),
    retry: retryTransient,
  })
}

// Records a manual full payment. On success the caller (e.g. the bill-detail
// dialog) can close in place via `onSuccess`; the toast always fires, and both
// the payments and bills caches are invalidated because the settled bill flips
// to "paid" (and may activate the tenant/room). No client retry — a repeat POST
// could duplicate the payment, and the backend rejects duplicates with a 409.
export function useRecordManualPayment(options?: {
  onSuccess?: (payment: Payment) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RecordManualPaymentInput) => recordManualPayment(input),
    retry: false,
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY })
      queryClient.invalidateQueries({ queryKey: BILLS_KEY })
      toast.success("Payment recorded")
      options?.onSuccess?.(payment)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
