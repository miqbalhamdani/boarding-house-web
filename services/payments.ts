import { apiFetch } from "@/lib/api/client"
import type { RecordManualPaymentInput } from "@/lib/payments/schemas"

// How a payment was recorded. `manual` is owner-entered backup; `gateway` is
// created by a verified gateway webhook — both are read-only here (Module 06).
export type PaymentSource = "manual" | "gateway"

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "e_wallet"
  | "virtual_account"
  | "credit_card"
  | "qris"
  | "other"

export type Payment = {
  id: string
  bill_id: string
  // Whole rupiah — equals the paid bill's amount (full payment only).
  amount: number
  payment_source: PaymentSource
  payment_method: PaymentMethod
  // RFC3339 timestamp of when the payment was made.
  payment_date: string
  reference_number?: string
  notes?: string
  // Set only for gateway payments; links to the settling transaction.
  gateway_transaction_id?: string
  // Denormalized labels the list/detail render. Optional because the payment
  // endpoints are not guaranteed to include them; fall back to "—" when absent.
  tenant_id?: string
  tenant_name?: string
  room_id?: string
  room_number?: string
  room_name?: string
  // YYYY-MM of the bill this payment settled.
  billing_month?: string
  created_at: string
  updated_at: string
}

export type PaymentListParams = {
  page?: number
  limit?: number
  tenant_id?: string
  // YYYY-MM — filters by payment_date month.
  month?: string
  source?: PaymentSource | ""
}

export type PaymentListResult = {
  payments: Payment[]
  total: number
  page: number
  limit: number
}

// Serialises only the params that carry a value so empty filters are omitted
// from the query string entirely.
function buildPaymentsQuery(params: PaymentListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  if (params.tenant_id) query.set("tenant_id", params.tenant_id)
  const month = params.month?.trim()
  if (month) query.set("month", month)
  if (params.source) query.set("source", params.source)
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export function listPayments(params: PaymentListParams = {}) {
  return apiFetch<PaymentListResult>(
    `/owner/payments${buildPaymentsQuery(params)}`,
    { method: "GET", kind: "owner" }
  )
}

export function getPayment(id: string) {
  return apiFetch<Payment>(`/owner/payments/${id}`, {
    method: "GET",
    kind: "owner",
  })
}

// Records a manual full payment for an unpaid bill. The backend enforces the
// full-amount, not-already-paid and one-payment-per-bill rules; `owner_id` is
// never sent — it is derived from the owner token server-side.
export function recordManualPayment(input: RecordManualPaymentInput) {
  return apiFetch<Payment>("/owner/payments/manual", {
    method: "POST",
    body: input,
    kind: "owner",
  })
}

// Re-exported for tests that exercise the query serialiser directly.
export { buildPaymentsQuery }
