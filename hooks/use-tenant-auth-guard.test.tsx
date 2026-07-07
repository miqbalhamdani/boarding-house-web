import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useTenantAuthGuard } from "@/hooks/use-tenant-auth-guard"
import { ApiClientError } from "@/lib/api/types"
import { TENANT_LOGIN } from "@/lib/auth/guard"

const replace = vi.fn()
const logout = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}))

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: { logout: () => void }) => unknown) =>
    selector({ logout }),
}))

describe("useTenantAuthGuard", () => {
  beforeEach(() => {
    replace.mockReset()
    logout.mockReset()
  })

  it("logs out and redirects to tenant login on a 401", () => {
    renderHook(() =>
      useTenantAuthGuard(new ApiClientError(401, "UNAUTHORIZED", "nope"))
    )
    expect(logout).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(TENANT_LOGIN)
  })

  it("logs out and redirects on a 403", () => {
    renderHook(() =>
      useTenantAuthGuard(new ApiClientError(403, "FORBIDDEN", "nope"))
    )
    expect(logout).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(TENANT_LOGIN)
  })

  it("does nothing for a 404 or transient error", () => {
    renderHook(() =>
      useTenantAuthGuard(new ApiClientError(404, "NOT_FOUND", "nope"))
    )
    expect(logout).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it("does nothing when there is no error", () => {
    renderHook(() => useTenantAuthGuard(null))
    expect(logout).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it("triggers on the first unauthorized error among several", () => {
    renderHook(() =>
      useTenantAuthGuard(
        null,
        new ApiClientError(500, "SERVER", "later"),
        new ApiClientError(401, "UNAUTHORIZED", "nope")
      )
    )
    expect(logout).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(TENANT_LOGIN)
  })
})
