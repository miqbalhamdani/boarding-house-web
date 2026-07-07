import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RecentPaymentsCard } from "@/components/dashboard/recent-payments-card"
import { usePayments } from "@/hooks/use-payments"
import { ApiClientError } from "@/lib/api/types"
import type { Payment } from "@/services/payments"

vi.mock("@/hooks/use-payments", () => ({
  usePayments: vi.fn(),
}))

const mockUsePayments = vi.mocked(usePayments)

type PaymentsReturn = ReturnType<typeof usePayments>

const payment: Payment = {
  id: "p1",
  bill_id: "b1",
  amount: 2000000,
  payment_source: "manual",
  payment_method: "bank_transfer",
  payment_date: "2026-07-05T10:00:00Z",
  tenant_name: "Budi Santoso",
  billing_month: "2026-07",
  created_at: "2026-07-05T10:00:00Z",
  updated_at: "2026-07-05T10:00:00Z",
}

function mockPayments(state: Partial<PaymentsReturn>) {
  mockUsePayments.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as PaymentsReturn)
}

describe("RecentPaymentsCard", () => {
  beforeEach(() => {
    mockUsePayments.mockReset()
  })

  it("queries the selected month with a preview limit", () => {
    mockPayments({ data: { payments: [], total: 0, page: 1, limit: 5 } })
    render(<RecentPaymentsCard month="2026-07" />)
    expect(mockUsePayments.mock.calls.at(-1)?.[0]).toMatchObject({
      month: "2026-07",
      limit: 5,
    })
  })

  it("renders the empty state when there are no payments", () => {
    mockPayments({ data: { payments: [], total: 0, page: 1, limit: 5 } })
    render(<RecentPaymentsCard month="2026-07" />)
    expect(
      screen.getByText("No payments recorded for this month yet.")
    ).toBeInTheDocument()
  })

  it("renders payment rows with tenant and IDR amount", () => {
    mockPayments({ data: { payments: [payment], total: 1, page: 1, limit: 5 } })
    render(<RecentPaymentsCard month="2026-07" />)
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockPayments({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(<RecentPaymentsCard month="2026-07" />)
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })
})
