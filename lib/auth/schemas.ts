import * as v from "valibot"

// Re-exported for backwards compatibility — the generic helper now lives in
// lib/forms/validate.ts so non-auth modules can reuse it without importing auth.
export { validate } from "@/lib/forms/validate"

// Form validation schemas. Note: no `owner_id` field anywhere — owner identity
// is always derived server-side from the token, never sent by the client.

const email = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Email is required"),
  v.email("Enter a valid email address")
)

const password = v.pipe(
  v.string(),
  v.nonEmpty("Password is required"),
  v.minLength(8, "Password must be at least 8 characters")
)

export const loginSchema = v.object({
  email,
  password,
})

export const ownerRegisterSchema = v.object({
  business_name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Business name is required")
  ),
  full_name: v.pipe(v.string(), v.trim(), v.nonEmpty("Full name is required")),
  email,
  phone_number: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Phone number is required"),
    v.regex(/^[0-9+][0-9\s-]{6,}$/, "Enter a valid phone number")
  ),
  password,
})

export type LoginInput = v.InferOutput<typeof loginSchema>
export type OwnerRegisterInput = v.InferOutput<typeof ownerRegisterSchema>
