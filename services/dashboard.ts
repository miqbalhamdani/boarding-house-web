import { apiFetch } from "@/lib/api/client"

// Owner overview metrics (Module 07). All counts/totals are scoped to the
// authenticated owner server-side (BR-001, BR-031). The endpoint returns only
// aggregates — the dashboard's bill/payment preview lists reuse the existing
// list endpoints (see use-bills / use-payments).
export type DashboardSummary = {
  total_rooms: number
  available_rooms: number
  occupied_rooms: number
  active_tenants: number
  unpaid_bills: number
  overdue_bills: number
  gateway_pending_bills: number
  paid_bills_this_month: number
  // Whole rupiah — sum of successful payments in the selected month. Gateway
  // pending bills are NOT counted as collected.
  collected_amount_this_month: number
}

// `month` is YYYY-MM. Optional — the backend defaults to the current calendar
// month when omitted. `owner_id` is never sent; it is derived from the token.
export function getDashboardSummary(month?: string) {
  const trimmed = month?.trim()
  const qs = trimmed ? `?month=${trimmed}` : ""
  return apiFetch<DashboardSummary>(`/owner/dashboard/summary${qs}`, {
    method: "GET",
    kind: "owner",
  })
}
