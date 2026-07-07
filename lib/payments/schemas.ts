import * as v from "valibot"

import type { PaymentMethod, PaymentSource } from "@/services/payments"

// Single source of truth for the payment source enum in the UI — drives the
// list filter and the source badge.
export const PAYMENT_SOURCES: PaymentSource[] = ["manual", "gateway"]

export const PAYMENT_SOURCE_LABEL: Record<PaymentSource, string> = {
  manual: "Manual",
  gateway: "Gateway",
}

// Payment methods accepted by the manual-payment endpoint (see Bruno spec).
// Drives the method dropdown and the read-only method labels.
export const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "bank_transfer",
  "e_wallet",
  "virtual_account",
  "credit_card",
  "qris",
  "other",
]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  e_wallet: "E-wallet",
  virtual_account: "Virtual account",
  credit_card: "Credit card",
  qris: "QRIS",
  other: "Other",
}

// Manual full-payment recording. The form is uncontrolled (FormData → all values
// arrive as strings). No `owner_id` is ever part of the payload — owner identity
// is derived server-side. `amount` is a hidden field pinned to the bill amount
// (full payment only, BR-019), so partial amounts can never be entered.

const billId = v.pipe(v.string(), v.nonEmpty("Bill is required"))

// Whole-rupiah integer. Mirrors the money pipe in lib/onboarding/schemas.ts.
const amount = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Amount is required"),
  v.transform((value) => Number(value)),
  v.number("Enter a valid amount"),
  v.check((n) => Number.isFinite(n), "Enter a valid amount"),
  v.integer("Amount must be a whole number"),
  v.minValue(1, "Amount must be greater than zero")
)

const paymentMethod = v.picklist(
  PAYMENT_METHODS,
  "Select a payment method"
)

// Optional payment date from a datetime-local input (local wall-clock, no zone).
// Blank means "use the server's current time" and is omitted from the payload.
// When provided it is normalised to an RFC3339 UTC timestamp.
const paymentDate = v.pipe(
  v.optional(v.string(), ""),
  v.trim(),
  v.transform((value) => {
    if (value === "") return undefined
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString()
  })
)

// Optional free-text fields: blank is transformed to `undefined` so they are
// omitted from the payload entirely.
const optionalText = v.pipe(
  v.optional(v.string(), ""),
  v.trim(),
  v.transform((value) => (value === "" ? undefined : value))
)

export const recordManualPaymentSchema = v.object({
  bill_id: billId,
  amount,
  payment_method: paymentMethod,
  payment_date: paymentDate,
  reference_number: optionalText,
  notes: optionalText,
})

export type RecordManualPaymentInput = v.InferOutput<
  typeof recordManualPaymentSchema
>
