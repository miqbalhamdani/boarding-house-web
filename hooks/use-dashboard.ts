"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { ApiClientError } from "@/lib/api/types"
import { getDashboardSummary } from "@/services/dashboard"

const DASHBOARD_KEY = ["dashboard"] as const

// Retry only transient failures (network / 5xx) once. Auth (401/403),
// validation (400) and not-found (404) errors won't fix themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

// `month` is YYYY-MM and always has a value (the picker defaults to the current
// month), so it is part of the query key — switching months refetches.
export function useDashboardSummary(month: string) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "summary", month],
    queryFn: () => getDashboardSummary(month),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}
