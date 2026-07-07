import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TenantPaymentResult } from "@/components/tenant/tenant-payment-result"
import { useTenantBill } from "@/hooks/use-tenant"
import { ApiClientError } from "@/lib/api/types"
import type { Bill } from "@/services/bills"

vi.mock("@/hooks/use-tenant", () => ({
  useTenantBill: vi.fn(),
}))
vi.mock("@/hooks/use-tenant-auth-guard", () => ({
  useTenantAuthGuard: vi.fn(),
}))

const mockUseTenantBill = vi.mocked(useTenantBill)

const bill: Bill = {
  id: "b1",
  room_assignment_id: "ra1",
  tenant_id: "t1",
  room_id: "r1",
  billing_month: "2026-07",
  amount: 2000000,
  due_date: "2026-07-10",
  status: "gateway_pending",
  created_at: "2026-07-01T00:05:00Z",
  updated_at: "2026-07-01T00:05:00Z",
}

function mockBill(state: Partial<ReturnType<typeof useTenantBill>>) {
  mockUseTenantBill.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as ReturnType<typeof useTenantBill>)
}

describe("TenantPaymentResult", () => {
  beforeEach(() => {
    mockUseTenantBill.mockReset()
    sessionStorage.clear()
  })

  it("shows 'waiting for confirmation' for a gateway_pending bill and never claims it is paid", () => {
    mockBill({ data: bill })
    render(<TenantPaymentResult billId="b1" />)
    expect(screen.getByText(/waiting for confirmation/i)).toBeInTheDocument()
    expect(screen.queryByText(/payment confirmed/i)).not.toBeInTheDocument()
  })

  it("re-checks the bill status when 'Check again' is clicked", () => {
    const refetch = vi.fn()
    mockBill({ data: bill, refetch })
    render(<TenantPaymentResult billId="b1" />)
    fireEvent.click(screen.getByRole("button", { name: /check again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it("shows a confirmed state only once the backend reports paid", () => {
    mockBill({ data: { ...bill, status: "paid" } })
    render(<TenantPaymentResult billId="b1" />)
    expect(screen.getByText(/payment confirmed/i)).toBeInTheDocument()
  })

  it("falls back to the stashed bill id when no query param is given", () => {
    sessionStorage.setItem("tenant_pay_bill_id", "b1")
    mockBill({ data: bill })
    render(<TenantPaymentResult />)
    expect(mockUseTenantBill).toHaveBeenCalledWith("b1")
  })

  it("shows a generic processing message when no bill id can be resolved", () => {
    mockBill({})
    render(<TenantPaymentResult />)
    expect(screen.getByText(/payment processing/i)).toBeInTheDocument()
  })

  it("shows a not-found state (never 'waiting') for a 404 bill id", () => {
    mockBill({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "Not found"),
    })
    render(<TenantPaymentResult billId="missing" />)
    expect(screen.getByText(/bill not found/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/waiting for confirmation/i)
    ).not.toBeInTheDocument()
  })
})
