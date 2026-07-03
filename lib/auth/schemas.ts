import * as v from "valibot"

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

// Runs a schema and returns either the parsed value or a flat field->message map
// suitable for rendering inline under each input.
export function validate<TSchema extends v.GenericSchema>(
  schema: TSchema,
  input: unknown
):
  | { success: true; output: v.InferOutput<TSchema> }
  | { success: false; errors: Record<string, string> } {
  const result = v.safeParse(schema, input)
  if (result.success) {
    return { success: true, output: result.output }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.issues) {
    const key = issue.path?.[0]?.key
    if (typeof key === "string" && !(key in errors)) {
      errors[key] = issue.message
    }
  }
  return { success: false, errors }
}
