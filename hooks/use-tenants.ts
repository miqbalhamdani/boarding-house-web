"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import type {
  TenantCreateInput,
  TenantUpdateInput,
} from "@/lib/tenants/schemas"
import {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
  type Tenant,
  type TenantListParams,
} from "@/services/tenants"

const TENANTS_KEY = ["tenants"] as const

// Retry only transient failures (network / 5xx) once. Auth (401/403) and
// not-found (404) errors won't fix themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

export function useTenants(params: TenantListParams) {
  return useQuery({
    queryKey: [...TENANTS_KEY, "list", params],
    queryFn: () => listTenants(params),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: [...TENANTS_KEY, "detail", id],
    queryFn: () => getTenant(id),
    enabled: Boolean(id),
    retry: retryTransient,
  })
}

// When `options.onSuccess` is provided (e.g. a modal wanting to close in place),
// it runs instead of the default navigate-to-detail. The success toast and cache
// invalidation always run.
export function useCreateTenant(options?: {
  onSuccess?: (tenant: Tenant) => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: TenantCreateInput) => createTenant(input),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: TENANTS_KEY })
      toast.success("Tenant created")
      if (options?.onSuccess) options.onSuccess(tenant)
      else router.push(`/owner/tenants/${tenant.id}`)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateTenant(
  id: string,
  options?: { onSuccess?: (tenant: Tenant) => void }
) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: TenantUpdateInput) => updateTenant(id, input),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: TENANTS_KEY })
      toast.success("Tenant updated")
      if (options?.onSuccess) options.onSuccess(tenant)
      else router.push(`/owner/tenants/${id}`)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteTenant() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_KEY })
      toast.success("Tenant deleted")
      router.push("/owner/tenants")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
