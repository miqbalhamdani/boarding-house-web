import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TenantBillDetail } from "@/components/tenant/tenant-bill-detail"
import { useTenantBill, usePayBill } from "@/hooks/use-tenant"
import { ApiClientError } from "@/lib/api/types"
import type { Bill } from "@/services/bills"

vi.mock("@/hooks/use-tenant", () => ({
  useTenantBill: vi.fn(),
  usePayBill: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock("@/hooks/use-tenant-auth-guard", () => ({
  useTenantAuthGuard: vi.fn(),
}))

const mockUseTenantBill = vi.mocked(useTenantBill)
const mockUsePayBill = vi.mocked(usePayBill)

const bill: Bill = {
  id: "b1",
  room_assignment_id: "ra1",
  tenant_id: "t1",
  room_id: "r1",
  billing_month: "2026-07",
  amount: 2000000,
  due_date: "2026-07-10",
  status: "unpaid",
  created_at: "2026-07-01T00:05:00Z",
  updated_at: "2026-07-01T00:05:00Z",
}

function mockBill(state: Partial<ReturnType<typeof useTenantBill>>) {
  mockUseTenantBill.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as ReturnType<typeof useTenantBill>)
}

describe("TenantBillDetail", () => {
  beforeEach(() => {
    mockUseTenantBill.mockReset()
    mockUsePayBill.mockReset()
    mockUsePayBill.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof usePayBill>)
  })

  it("shows a not-found state on a 404", () => {
    mockBill({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "Not found"),
    })
    render(<TenantBillDetail id="b1" />)
    expect(screen.getByText(/bill not found/i)).toBeInTheDocument()
  })

  it("renders amount, status and an enabled Pay Now for an unpaid bill", () => {
    mockBill({ data: bill })
    render(<TenantBillDetail id="b1" />)
    expect(screen.getAllByText(/Rp\s?2\.000\.000/).length).toBeGreaterThan(0)
    expect(screen.getAllByText("Unpaid").length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: /pay now/i })).toBeEnabled()
  })

  it("shows an overdue warning for an overdue bill", () => {
    mockBill({ data: { ...bill, status: "overdue" } })
    render(<TenantBillDetail id="b1" />)
    expect(
      screen.getByText(/please pay as soon as possible/i)
    ).toBeInTheDocument()
  })

  it("does not offer Pay Now for a paid bill", () => {
    mockBill({ data: { ...bill, status: "paid" } })
    render(<TenantBillDetail id="b1" />)
    expect(
      screen.queryByRole("button", { name: /pay now/i })
    ).not.toBeInTheDocument()
    expect(screen.getByText(/already paid/i)).toBeInTheDocument()
  })
})
