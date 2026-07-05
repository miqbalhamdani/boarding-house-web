import { apiFetch } from "@/lib/api/client"
import type { TenantCreateInput, TenantUpdateInput } from "@/lib/tenants/schemas"

export type TenantStatus =
  | "pending_payment"
  | "active"
  | "moved_out"
  | "cancelled"

export type Tenant = {
  id: string
  full_name: string
  phone_number: string
  email: string
  identity_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  status: TenantStatus
  // Whether tenant-portal login credentials have been generated for this tenant.
  has_portal_access: boolean
  created_at: string
  updated_at: string
}

export type TenantListParams = {
  page?: number
  limit?: number
  status?: TenantStatus | ""
  search?: string
}

export type TenantListResult = {
  tenants: Tenant[]
  total: number
  page: number
  limit: number
}

// Serialises only the params that carry a value so empty status/search are
// omitted from the query string entirely.
function buildTenantsQuery(params: TenantListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  if (params.status) query.set("status", params.status)
  const search = params.search?.trim()
  if (search) query.set("search", search)
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export function listTenants(params: TenantListParams = {}) {
  return apiFetch<TenantListResult>(
    `/owner/tenants${buildTenantsQuery(params)}`,
    { method: "GET", kind: "owner" }
  )
}

export function getTenant(id: string) {
  return apiFetch<Tenant>(`/owner/tenants/${id}`, {
    method: "GET",
    kind: "owner",
  })
}

export function createTenant(input: TenantCreateInput) {
  return apiFetch<Tenant>("/owner/tenants", {
    method: "POST",
    body: input,
    kind: "owner",
  })
}

export function updateTenant(id: string, input: TenantUpdateInput) {
  return apiFetch<Tenant>(`/owner/tenants/${id}`, {
    method: "PATCH",
    body: input,
    kind: "owner",
  })
}

export function deleteTenant(id: string) {
  // The delete response carries only a top-level `message` (no `data`), so
  // there is nothing to unwrap — resolves to undefined on success.
  return apiFetch<void>(`/owner/tenants/${id}`, {
    method: "DELETE",
    kind: "owner",
  })
}
