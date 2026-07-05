import * as v from "valibot"

// Runs a schema and returns either the parsed value or a flat field->message map
// suitable for rendering inline under each input. Schema-agnostic — shared by all
// forms (auth, rooms, …).
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
