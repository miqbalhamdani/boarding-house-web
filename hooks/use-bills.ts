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
import type { GenerateMonthlyInput } from "@/lib/bills/schemas"
import {
  generateMonthlyBills,
  getBill,
  listBills,
  markOverdueBills,
  type BillListParams,
  type GenerateMonthlyResult,
  type MarkOverdueResult,
} from "@/services/bills"

const BILLS_KEY = ["bills"] as const

// Retry only transient failures (network / 5xx) once. Auth (401/403),
// validation (400) and not-found (404) errors won't fix themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

export function useBills(params: BillListParams) {
  return useQuery({
    queryKey: [...BILLS_KEY, "list", params],
    queryFn: () => listBills(params),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}

export function useBill(id: string) {
  return useQuery({
    queryKey: [...BILLS_KEY, "detail", id],
    queryFn: () => getBill(id),
    enabled: Boolean(id),
    retry: retryTransient,
  })
}

// Backup manual generation. On success the dialog swaps to a summary panel via
// `onSuccess`; the toast and cache invalidation always run.
export function useGenerateMonthlyBills(options?: {
  onSuccess?: (result: GenerateMonthlyResult) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: GenerateMonthlyInput) => generateMonthlyBills(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: BILLS_KEY })
      toast.success(
        `Generated ${result.created} bill${result.created === 1 ? "" : "s"} · ${result.skipped} skipped`
      )
      options?.onSuccess?.(result)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

// Flips unpaid past-due bills to overdue. No body.
export function useMarkOverdueBills(options?: {
  onSuccess?: (result: MarkOverdueResult) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markOverdueBills(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: BILLS_KEY })
      toast.success(
        `${result.updated} bill${result.updated === 1 ? "" : "s"} marked overdue`
      )
      options?.onSuccess?.(result)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
