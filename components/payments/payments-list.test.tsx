import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PaymentsListView } from "@/components/payments/payments-list"
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
  payment_date: "2026-07-10T10:00:00Z",
  reference_number: "TRX-001",
  tenant_id: "t1",
  tenant_name: "Budi Santoso",
  room_id: "r1",
  room_number: "A-01",
  room_name: "Kamar Depan",
  billing_month: "2026-07",
  created_at: "2026-07-10T10:00:05Z",
  updated_at: "2026-07-10T10:00:05Z",
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

describe("PaymentsListView", () => {
  beforeEach(() => {
    mockUsePayments.mockReset()
  })

  it("renders an empty state when there are no payments", () => {
    mockPayments({ data: { payments: [], total: 0, page: 1, limit: 20 } })
    render(<PaymentsListView />)
    expect(screen.getByText(/no payments found/i)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockPayments({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(<PaymentsListView />)
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it("renders payments with IDR amount, room label, method and source", () => {
    mockPayments({ data: { payments: [payment], total: 1, page: 1, limit: 20 } })
    render(<PaymentsListView />)
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument()
    expect(screen.getByText(/A-01 · Kamar Depan/)).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText("Bank transfer")).toBeInTheDocument()
    expect(screen.getByText("Manual")).toBeInTheDocument()
  })

  it("passes the month filter into the query and resets to page 1", () => {
    mockPayments({ data: { payments: [payment], total: 1, page: 1, limit: 20 } })
    render(<PaymentsListView />)
    fireEvent.change(screen.getByLabelText(/filter by payment month/i), {
      target: { value: "2026-08" },
    })
    const lastCall = mockUsePayments.mock.calls.at(-1)?.[0]
    expect(lastCall).toMatchObject({ month: "2026-08", page: 1 })
  })
})
