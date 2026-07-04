"use client"

// The auth forms' submit logic is fully generic — it now lives in
// hooks/use-form.ts as `useValidatedForm`. Kept here as a named re-export so the
// existing auth form imports (and their tests) continue to work unchanged.
export { useValidatedForm as useAuthForm } from "@/hooks/use-form"
