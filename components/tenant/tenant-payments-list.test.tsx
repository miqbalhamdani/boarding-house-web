import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TenantPaymentsList } from "@/components/tenant/tenant-payments-list"
import { useTenantPayments } from "@/hooks/use-tenant"
import { ApiClientError } from "@/lib/api/types"
import type { Payment } from "@/services/payments"

vi.mock("@/hooks/use-tenant", () => ({
  useTenantPayments: vi.fn(),
}))
vi.mock("@/hooks/use-tenant-auth-guard", () => ({
  useTenantAuthGuard: vi.fn(),
}))

const mockUseTenantPayments = vi.mocked(useTenantPayments)

type PaymentsReturn = ReturnType<typeof useTenantPayments>

const payment: Payment = {
  id: "p1",
  bill_id: "b1",
  amount: 2000000,
  payment_source: "gateway",
  payment_method: "qris",
  payment_date: "2026-07-10T10:00:00Z",
  billing_month: "2026-07",
  created_at: "2026-07-10T10:00:05Z",
  updated_at: "2026-07-10T10:00:05Z",
}

function mockPayments(state: Partial<PaymentsReturn>) {
  mockUseTenantPayments.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as PaymentsReturn)
}

describe("TenantPaymentsList", () => {
  beforeEach(() => {
    mockUseTenantPayments.mockReset()
  })

  it("renders an empty state when there are no payments", () => {
    mockPayments({ data: { payments: [], total: 0, page: 1, limit: 20 } })
    render(<TenantPaymentsList />)
    expect(screen.getByText(/no payments yet/i)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockPayments({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(<TenantPaymentsList />)
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it("renders payments with an IDR amount, method and source", () => {
    mockPayments({ data: { payments: [payment], total: 1, page: 1, limit: 20 } })
    render(<TenantPaymentsList />)
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText("QRIS")).toBeInTheDocument()
    expect(screen.getByText("Gateway")).toBeInTheDocument()
  })

  it("requests the first page with a limit", () => {
    mockPayments({ data: { payments: [payment], total: 1, page: 1, limit: 20 } })
    render(<TenantPaymentsList />)
    expect(mockUseTenantPayments.mock.calls.at(0)?.[0]).toMatchObject({
      page: 1,
      limit: 20,
    })
  })
})
