import * as v from "valibot"

// Tenant onboarding (assign-room) validation. The form is uncontrolled
// (FormData → all values arrive as strings), so id fields are validated as
// non-empty strings and numeric fields are coerced. No `owner_id` is ever part
// of the payload — owner identity is derived server-side. `reserved` /
// `pending_payment` states are system-managed and never set from this form.

const tenantId = v.pipe(v.string(), v.nonEmpty("Select a tenant"))

const roomId = v.pipe(v.string(), v.nonEmpty("Select a room"))

// Expected as YYYY-MM-DD (native date input). Rejects blanks and malformed dates.
const startDate = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Start date is required"),
  v.isoDate("Enter a valid date")
)

// Whole-rupiah integer. Mirrors the money pipe in lib/rooms/schemas.ts: coerces
// the string form value, rejecting blanks, non-numbers, fractions and
// non-positive amounts.
const monthlyRent = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Monthly rent is required"),
  v.transform((value) => Number(value)),
  v.number("Enter a valid amount"),
  v.check((n) => Number.isFinite(n), "Enter a valid amount"),
  v.integer("Monthly rent must be a whole number"),
  v.minValue(1, "Monthly rent must be greater than zero")
)

// Day of the month (1–31) the rent falls due.
const paymentDueDay = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Payment due day is required"),
  v.transform((value) => Number(value)),
  v.number("Enter a valid day"),
  v.check((n) => Number.isFinite(n), "Enter a valid day"),
  v.integer("Due day must be a whole number"),
  v.minValue(1, "Due day must be between 1 and 31"),
  v.maxValue(31, "Due day must be between 1 and 31")
)

export const assignRoomSchema = v.object({
  tenant_id: tenantId,
  room_id: roomId,
  start_date: startDate,
  monthly_rent: monthlyRent,
  payment_due_day: paymentDueDay,
})

export type AssignRoomInput = v.InferOutput<typeof assignRoomSchema>
