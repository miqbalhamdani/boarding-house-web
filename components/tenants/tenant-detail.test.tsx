import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TenantDetail } from "@/components/tenants/tenant-detail"
import { useTenant } from "@/hooks/use-tenants"
import { ApiClientError } from "@/lib/api/types"
import type { Tenant } from "@/services/tenants"

vi.mock("@/hooks/use-tenants", () => ({
  useTenant: vi.fn(),
  // TenantDetail renders a (closed) TenantFormDialog, which imports these;
  // stubbed so the module mock exposes them even though the closed dialog never calls them.
  useCreateTenant: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateTenant: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

const mockUseTenant = vi.mocked(useTenant)

const tenant: Tenant = {
  id: "t1",
  full_name: "Budi Santoso",
  phone_number: "081234567890",
  email: "budi@example.com",
  identity_number: "317300001",
  emergency_contact_name: "Siti",
  emergency_contact_phone: "081299988877",
  status: "active",
  has_portal_access: false,
  created_at: "2026-07-01T08:00:00Z",
  updated_at: "2026-07-01T08:00:00Z",
}

function mockTenant(state: Partial<ReturnType<typeof useTenant>>) {
  mockUseTenant.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...state,
  } as ReturnType<typeof useTenant>)
}

describe("TenantDetail", () => {
  beforeEach(() => {
    mockUseTenant.mockReset()
  })

  it("shows a not-found state on a 404", () => {
    mockTenant({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "Not found"),
    })
    render(<TenantDetail id="t1" />)
    expect(screen.getByText(/tenant not found/i)).toBeInTheDocument()
  })

  it("renders tenant profile info and portal-access state", () => {
    mockTenant({ data: tenant })
    render(<TenantDetail id="t1" />)
    expect(
      screen.getByRole("heading", { name: /budi santoso/i })
    ).toBeInTheDocument()
    expect(screen.getByText("budi@example.com")).toBeInTheDocument()
    // has_portal_access is false → the highlight card reads "No".
    expect(screen.getByText("No")).toBeInTheDocument()
  })

  it("renders a back link to the tenants list", () => {
    mockTenant({ data: tenant })
    render(<TenantDetail id="t1" />)
    expect(
      screen.getByRole("link", { name: /back to tenants/i })
    ).toHaveAttribute("href", "/owner/tenants")
  })
})
