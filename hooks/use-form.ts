"use client"

import { useState } from "react"
import * as v from "valibot"

import { ApiClientError } from "@/lib/api/types"
import { validate } from "@/lib/forms/validate"

type Mutationish<TInput> = {
  mutate: (values: TInput) => void
  error: unknown
}

// Shared submit + error-merging logic for uncontrolled forms. Reads the form via
// FormData, validates with the given Valibot schema, and on success calls the
// mutation. `fieldError` merges client validation errors with server-returned
// field errors (ApiClientError.fields) so each input shows one message.
export function useValidatedForm<TSchema extends v.GenericSchema>(
  schema: TSchema,
  mutation: Mutationish<v.InferOutput<TSchema>>
) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const apiFields =
    mutation.error instanceof ApiClientError ? mutation.error.fields : {}

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const result = validate(schema, values)
    if (!result.success) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    mutation.mutate(result.output)
  }

  const fieldError = (name: string) => errors[name] ?? apiFields[name]

  return { handleSubmit, fieldError }
}
