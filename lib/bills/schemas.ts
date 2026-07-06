import * as v from "valibot"

import type { BillStatus } from "@/services/bills"

// Single source of truth for the bill status enum in the UI — drives the filter
// dropdown, the status badge, and the detail help copy.
export const BILL_STATUSES: BillStatus[] = [
  "unpaid",
  "gateway_pending",
  "paid",
  "overdue",
  "cancelled",
]

export const BILL_STATUS_LABEL: Record<BillStatus, string> = {
  unpaid: "Unpaid",
  gateway_pending: "Gateway pending",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
}

// Manual "generate monthly bills" backup action. The form is uncontrolled
// (FormData → string values). `billing_month` is required in the form (the
// month input always has a value) and must be YYYY-MM with a valid 01–12 month.
// No `owner_id` is ever part of the payload — owner identity is derived
// server-side.
const billingMonth = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Billing month is required"),
  v.regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use format YYYY-MM")
)

export const generateMonthlySchema = v.object({
  billing_month: billingMonth,
})

export type GenerateMonthlyInput = v.InferOutput<typeof generateMonthlySchema>
