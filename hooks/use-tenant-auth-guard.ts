"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { ApiClientError } from "@/lib/api/types"
import { TENANT_LOGIN } from "@/lib/auth/guard"
import { useAuthStore } from "@/stores/auth-store"

// The API client clears tokens on a terminal 401, but the middleware guard only
// runs on navigation — so a tenant session that dies while sitting on a page
// must send the user back to login itself. Pass a query error (or errors); when
// one is a 401/403 this logs out and redirects. Reused across every tenant view.
export function useTenantAuthGuard(...errors: unknown[]): void {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  const unauthorized = errors.some(
    (error) =>
      error instanceof ApiClientError &&
      (error.status === 401 || error.status === 403)
  )

  useEffect(() => {
    if (unauthorized) {
      logout()
      router.replace(TENANT_LOGIN)
    }
  }, [unauthorized, logout, router])
}
