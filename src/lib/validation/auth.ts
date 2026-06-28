import * as v from "valibot";

const email = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Email is required"),
  v.email("Enter a valid email address"),
);

const requiredPassword = v.pipe(
  v.string(),
  v.nonEmpty("Password is required"),
);

const phoneNumber = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Phone number is required"),
  v.regex(/^[0-9+\-\s]{6,20}$/, "Enter a valid phone number"),
);

/** Owner registration form. Mirrors `POST /auth/owner/register`. */
export const OwnerRegisterSchema = v.object({
  business_name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Business name is required"),
  ),
  full_name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Full name is required"),
  ),
  email,
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
  phone_number: phoneNumber,
});
export type OwnerRegisterInput = v.InferOutput<typeof OwnerRegisterSchema>;

/** Owner login form. Mirrors `POST /auth/owner/login`. */
export const OwnerLoginSchema = v.object({
  email,
  password: requiredPassword,
});
export type OwnerLoginInput = v.InferOutput<typeof OwnerLoginSchema>;

/** Tenant login form. Mirrors `POST /auth/tenant/login`. */
export const TenantLoginSchema = v.object({
  email,
  password: requiredPassword,
});
export type TenantLoginInput = v.InferOutput<typeof TenantLoginSchema>;

export function safeParseOwnerRegister(input: unknown) {
  return v.safeParse(OwnerRegisterSchema, input);
}
export function safeParseOwnerLogin(input: unknown) {
  return v.safeParse(OwnerLoginSchema, input);
}
export function safeParseTenantLogin(input: unknown) {
  return v.safeParse(TenantLoginSchema, input);
}

/**
 * Flatten valibot issues into a `{ field: message }` map for inline display.
 * Only the first message per field is kept.
 */
export function fieldErrors(
  issues: ReadonlyArray<v.BaseIssue<unknown>> | undefined,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!issues || issues.length === 0) return result;
  const flat = v.flatten(
    issues as [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]],
  );
  for (const [key, messages] of Object.entries(flat.nested ?? {})) {
    if (messages && messages.length > 0) result[key] = messages[0];
  }
  return result;
}
