import * as v from "valibot"

// Tenant form validation. Forms are uncontrolled (FormData → all values arrive
// as strings). No `owner_id` is ever part of a tenant payload — owner identity
// is derived server-side. No `status` field either: create is always
// `pending_payment`, and activation / move-out / cancel are governed by other
// modules (first-bill payment, onboarding). Status here only drives the list
// filter and read-only displays.

export const TENANT_STATUSES = [
  "pending_payment",
  "active",
  "moved_out",
  "cancelled",
] as const

// Display labels for each status — shared by the badge and the list filter.
export const TENANT_STATUS_LABEL: Record<
  (typeof TENANT_STATUSES)[number],
  string
> = {
  pending_payment: "Pending payment",
  active: "Active",
  moved_out: "Moved out",
  cancelled: "Cancelled",
}

const fullName = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Full name is required")
)

const phoneNumber = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Phone number is required")
)

const email = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Email is required"),
  v.email("Enter a valid email address")
)

const identityNumber = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Identity number is required")
)

const emergencyContactName = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Emergency contact name is required")
)

const emergencyContactPhone = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Emergency contact phone is required")
)

// Optional portal password. Blank means "no portal access / leave unchanged":
// it passes validation and is transformed to `undefined` so it is omitted from
// the payload entirely. When provided it must be at least 6 characters.
const password = v.pipe(
  v.optional(v.string(), ""),
  v.trim(),
  v.check(
    (value) => value === "" || value.length >= 6,
    "Password must be at least 6 characters"
  ),
  v.transform((value) => (value === "" ? undefined : value))
)

const tenantFields = {
  full_name: fullName,
  phone_number: phoneNumber,
  email,
  identity_number: identityNumber,
  emergency_contact_name: emergencyContactName,
  emergency_contact_phone: emergencyContactPhone,
  password,
}

export const tenantCreateSchema = v.object(tenantFields)
export const tenantUpdateSchema = v.object(tenantFields)

export type TenantCreateInput = v.InferOutput<typeof tenantCreateSchema>
export type TenantUpdateInput = v.InferOutput<typeof tenantUpdateSchema>
