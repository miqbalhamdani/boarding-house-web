import { apiFetch } from "@/lib/api/client"
import type { GenerateMonthlyInput } from "@/lib/bills/schemas"

export type BillStatus =
  | "unpaid"
  | "gateway_pending"
  | "paid"
  | "overdue"
  | "cancelled"

export type Bill = {
  id: string
  room_assignment_id: string
  tenant_id: string
  room_id: string
  // YYYY-MM
  billing_month: string
  // Whole rupiah.
  amount: number
  // YYYY-MM-DD
  due_date: string
  status: BillStatus
  // Denormalized labels the list/detail render. Optional because the bill
  // endpoints are not guaranteed to include them; fall back to "—" when absent.
  tenant_name?: string
  room_number?: string
  room_name?: string
  created_at: string
  updated_at: string
}

export type BillListParams = {
  page?: number
  limit?: number
  status?: BillStatus | ""
  // YYYY-MM
  billing_month?: string
  tenant_id?: string
  room_id?: string
}

export type BillListResult = {
  bills: Bill[]
  total: number
  page: number
  limit: number
}

export type GenerateMonthlyResult = {
  billing_month: string
  active_assignments: number
  created: number
  skipped: number
}

export type MarkOverdueResult = {
  updated: number
}

// Serialises only the params that carry a value so empty filters are omitted
// from the query string entirely.
function buildBillsQuery(params: BillListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  if (params.status) query.set("status", params.status)
  const billingMonth = params.billing_month?.trim()
  if (billingMonth) query.set("billing_month", billingMonth)
  if (params.tenant_id) query.set("tenant_id", params.tenant_id)
  if (params.room_id) query.set("room_id", params.room_id)
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export function listBills(params: BillListParams = {}) {
  return apiFetch<BillListResult>(`/owner/bills${buildBillsQuery(params)}`, {
    method: "GET",
    kind: "owner",
  })
}

export function getBill(id: string) {
  return apiFetch<Bill>(`/owner/bills/${id}`, {
    method: "GET",
    kind: "owner",
  })
}

// Backup manual generation. `billing_month` is optional; the backend defaults to
// the current month. Idempotent — reruns skip assignments already billed.
export function generateMonthlyBills(input: GenerateMonthlyInput) {
  return apiFetch<GenerateMonthlyResult>("/owner/bills/generate-monthly", {
    method: "POST",
    body: input,
    kind: "owner",
  })
}

// Flips the owner's unpaid, past-due bills to "overdue". Takes no body.
export function markOverdueBills() {
  return apiFetch<MarkOverdueResult>("/owner/bills/mark-overdue", {
    method: "POST",
    kind: "owner",
  })
}

// Re-exported for tests that exercise the query serialiser directly.
export { buildBillsQuery }
