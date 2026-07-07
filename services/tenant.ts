import { apiFetch } from "@/lib/api/client"
import type {
  Bill,
  BillListResult,
  BillStatus,
} from "@/services/bills"
import type { PaymentListResult } from "@/services/payments"

// The tenant portal reuses the owner-side Bill/Payment shapes (Module 05/06);
// the backend returns the same records, just scoped to the authenticated tenant
// (BR-002). owner_id/tenant_id are always derived from the tenant token.

// GET /tenant/me — Bruno only asserts `data.id`; keep the shape loose but useful.
export type TenantProfile = {
  id: string
  full_name?: string
  email?: string
  phone_number?: string
  status?: string
}

export type TenantBillListParams = {
  page?: number
  limit?: number
  status?: BillStatus | ""
}

// POST /tenant/bills/{id}/pay — mirrors the Bruno "Pay Bill" response (201).
export type PayBillResult = {
  gateway_transaction_id: string
  checkout_url: string
  status: string
}

// Serialises only the params that carry a value so empty filters are omitted
// from the query string entirely.
function buildTenantBillsQuery(params: TenantBillListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  if (params.status) query.set("status", params.status)
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export type TenantPaymentListParams = {
  page?: number
  limit?: number
}

function buildTenantPaymentsQuery(params: TenantPaymentListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export function getMyProfile() {
  return apiFetch<TenantProfile>("/tenant/me", {
    method: "GET",
    kind: "tenant",
  })
}

export function listTenantBills(params: TenantBillListParams = {}) {
  return apiFetch<BillListResult>(`/tenant/bills${buildTenantBillsQuery(params)}`, {
    method: "GET",
    kind: "tenant",
  })
}

export function getTenantBill(id: string) {
  return apiFetch<Bill>(`/tenant/bills/${id}`, {
    method: "GET",
    kind: "tenant",
  })
}

// Opens a gateway checkout for the tenant's own bill (BR-020/BR-021). The amount
// is never sent — it is always the bill amount server-side (BR-022). `provider`
// is optional; omit it to use the server's configured default.
export function payBill(billId: string, provider?: string) {
  return apiFetch<PayBillResult>(`/tenant/bills/${billId}/pay`, {
    method: "POST",
    body: provider ? { provider } : {},
    kind: "tenant",
  })
}

export function listTenantPayments(params: TenantPaymentListParams = {}) {
  return apiFetch<PaymentListResult>(
    `/tenant/payments${buildTenantPaymentsQuery(params)}`,
    { method: "GET", kind: "tenant" }
  )
}

// Re-exported for tests that exercise the query serialisers directly.
export { buildTenantBillsQuery, buildTenantPaymentsQuery }
