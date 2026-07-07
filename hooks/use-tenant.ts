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
import {
  getMyProfile,
  getTenantBill,
  listTenantBills,
  listTenantPayments,
  payBill,
  type PayBillResult,
  type TenantBillListParams,
  type TenantPaymentListParams,
} from "@/services/tenant"

const TENANT_BILLS_KEY = ["tenant", "bills"] as const
const TENANT_PAYMENTS_KEY = ["tenant", "payments"] as const

// Retry only transient failures (network / 5xx) once. Auth (401/403),
// validation (400) and not-found (404) errors won't fix themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["tenant", "me"],
    queryFn: getMyProfile,
    retry: retryTransient,
  })
}

export function useTenantBills(params: TenantBillListParams) {
  return useQuery({
    queryKey: [...TENANT_BILLS_KEY, "list", params],
    queryFn: () => listTenantBills(params),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}

export function useTenantBill(id: string) {
  return useQuery({
    queryKey: [...TENANT_BILLS_KEY, "detail", id],
    queryFn: () => getTenantBill(id),
    enabled: Boolean(id),
    retry: retryTransient,
  })
}

export function useTenantPayments(params: TenantPaymentListParams) {
  return useQuery({
    queryKey: [...TENANT_PAYMENTS_KEY, "list", params],
    queryFn: () => listTenantPayments(params),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}

// Opens a gateway checkout for a bill. `retry: false` guards against creating a
// duplicate checkout on a flaky network (BR-021) and against double submit — the
// component also disables the button while pending. The caller performs the
// redirect in `onSuccess`; the toast fires only on error here.
export function usePayBill(options?: {
  onSuccess?: (result: PayBillResult) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (billId: string) => payBill(billId),
    retry: false,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TENANT_BILLS_KEY })
      options?.onSuccess?.(result)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
