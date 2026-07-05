import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { TenantsListView } from "@/components/tenants/tenants-list"
import { useDeleteTenant, useTenants } from "@/hooks/use-tenants"
import { ApiClientError } from "@/lib/api/types"
import type { Tenant } from "@/services/tenants"

vi.mock("@/hooks/use-tenants", () => ({
  useTenants: vi.fn(),
  useDeleteTenant: vi.fn(),
  // The list and its rows render (closed) TenantFormDialogs, which import these;
  // stubbed so the module mock exposes them even though closed dialogs never call them.
  useCreateTenant: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateTenant: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useTenant: vi.fn(() => ({ data: undefined, isPending: true, isError: false })),
}))

const mockUseTenants = vi.mocked(useTenants)
const mockUseDeleteTenant = vi.mocked(useDeleteTenant)

type TenantsReturn = ReturnType<typeof useTenants>

const tenant: Tenant = {
  id: "t1",
  full_name: "Budi Santoso",
  phone_number: "081234567890",
  email: "budi@example.com",
  identity_number: "317300001",
  emergency_contact_name: "Siti",
  emergency_contact_phone: "081299988877",
  status: "pending_payment",
  has_portal_access: true,
  created_at: "2026-07-01T08:00:00Z",
  updated_at: "2026-07-01T08:00:00Z",
}

function mockTenants(state: Partial<TenantsReturn>) {
  mockUseTenants.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as TenantsReturn)
}

describe("TenantsListView", () => {
  beforeEach(() => {
    mockUseTenants.mockReset()
    mockUseDeleteTenant.mockReset()
    mockUseDeleteTenant.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteTenant>)
  })

  it("renders an empty state when there are no tenants", () => {
    mockTenants({ data: { tenants: [], total: 0, page: 1, limit: 20 } })
    render(<TenantsListView />)
    expect(screen.getByText(/no tenants found/i)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockTenants({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(<TenantsListView />)
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it("renders a tenant row with a status badge and row actions menu", () => {
    mockTenants({ data: { tenants: [tenant], total: 1, page: 1, limit: 20 } })
    render(<TenantsListView />)
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument()
    expect(screen.getByText("081234567890")).toBeInTheDocument()
    expect(screen.getByText(/pending payment/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /open menu for budi santoso/i })
    ).toBeInTheDocument()
  })

  describe("search", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it("passes the debounced search term into the query", () => {
      mockTenants({ data: { tenants: [tenant], total: 1, page: 1, limit: 20 } })
      render(<TenantsListView />)
      fireEvent.change(screen.getByLabelText(/search tenants/i), {
        target: { value: "budi" },
      })
      act(() => {
        vi.advanceTimersByTime(300)
      })
      const lastCall = mockUseTenants.mock.calls.at(-1)?.[0]
      expect(lastCall).toMatchObject({ search: "budi", page: 1 })
    })
  })
})
