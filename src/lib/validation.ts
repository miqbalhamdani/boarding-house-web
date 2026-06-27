import * as v from "valibot";

/** Roles a user can hold within the app. */
export const RoleSchema = v.picklist(["admin", "editor", "viewer"]);

/** Schema describing a single user record. */
export const UserSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, "id is required")),
  name: v.pipe(v.string(), v.minLength(2, "Name must be at least 2 characters")),
  email: v.pipe(v.string(), v.email("Invalid email address")),
  role: RoleSchema,
  createdAt: v.pipe(v.string(), v.isoTimestamp("Invalid timestamp")),
});

export type User = v.InferOutput<typeof UserSchema>;
export type Role = v.InferOutput<typeof RoleSchema>;

/** Schema for the new-user form (no id / createdAt — those are generated). */
export const NewUserSchema = v.omit(UserSchema, ["id", "createdAt"]);
export type NewUser = v.InferOutput<typeof NewUserSchema>;

/** Parse unknown input into a validated User, throwing on failure. */
export function parseUser(input: unknown): User {
  return v.parse(UserSchema, input);
}

/** Safe-parse a new-user payload, returning the valibot result object. */
export function safeParseNewUser(input: unknown) {
  return v.safeParse(NewUserSchema, input);
}
