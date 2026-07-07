import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { OutstandingBillsCard } from "@/components/dashboard/outstanding-bills-card"
import { useBills } from "@/hooks/use-bills"
import { ApiClientError } from "@/lib/api/types"
import type { Bill } from "@/services/bills"

vi.mock("@/hooks/use-bills", () => ({
  useBills: vi.fn(),
}))

const mockUseBills = vi.mocked(useBills)

type BillsReturn = ReturnType<typeof useBills>

const bill: Bill = {
  id: "b1",
  room_assignment_id: "ra1",
  tenant_id: "t1",
  room_id: "r1",
  billing_month: "2026-07",
  amount: 2000000,
  due_date: "2026-07-10",
  status: "overdue",
  tenant_name: "Budi Santoso",
  room_number: "A-01",
  room_name: "Kamar Depan",
  created_at: "2026-07-01T00:00:00Z",
  updated_at: "2026-07-01T00:00:00Z",
}

function mockBills(state: Partial<BillsReturn>) {
  mockUseBills.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as BillsReturn)
}

describe("OutstandingBillsCard", () => {
  beforeEach(() => {
    mockUseBills.mockReset()
  })

  it("queries the given status with a preview limit", () => {
    mockBills({ data: { bills: [], total: 0, page: 1, limit: 5 } })
    render(
      <OutstandingBillsCard title="Overdue bills" status="overdue" emptyText="None" />
    )
    expect(mockUseBills.mock.calls.at(-1)?.[0]).toMatchObject({
      status: "overdue",
      limit: 5,
    })
  })

  it("renders the empty state when there are no bills", () => {
    mockBills({ data: { bills: [], total: 0, page: 1, limit: 5 } })
    render(
      <OutstandingBillsCard
        title="Overdue bills"
        status="overdue"
        emptyText="No overdue bills."
      />
    )
    expect(screen.getByText("No overdue bills.")).toBeInTheDocument()
  })

  it("renders bill rows with tenant, room and IDR amount", () => {
    mockBills({ data: { bills: [bill], total: 1, page: 1, limit: 5 } })
    render(
      <OutstandingBillsCard title="Overdue bills" status="overdue" emptyText="None" />
    )
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument()
    expect(screen.getByText(/A-01 · Kamar Depan/)).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockBills({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(
      <OutstandingBillsCard title="Overdue bills" status="overdue" emptyText="None" />
    )
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })
})
