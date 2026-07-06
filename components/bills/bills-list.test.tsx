import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { BillsListView } from "@/components/bills/bills-list"
import { useBills, useMarkOverdueBills } from "@/hooks/use-bills"
import { ApiClientError } from "@/lib/api/types"
import type { Bill } from "@/services/bills"

vi.mock("@/hooks/use-bills", () => ({
  useBills: vi.fn(),
  useMarkOverdueBills: vi.fn(),
  // The list renders a (closed) GenerateBillsDialog, which imports this; stubbed
  // so the module mock exposes it even though the closed dialog never calls it.
  useGenerateMonthlyBills: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

const mockUseBills = vi.mocked(useBills)
const mockUseMarkOverdueBills = vi.mocked(useMarkOverdueBills)

type BillsReturn = ReturnType<typeof useBills>

const bill: Bill = {
  id: "b1",
  room_assignment_id: "ra1",
  tenant_id: "t1",
  room_id: "r1",
  billing_month: "2026-07",
  amount: 2000000,
  due_date: "2026-07-10",
  status: "unpaid",
  tenant_name: "Budi Santoso",
  room_number: "A-01",
  room_name: "Kamar Depan",
  created_at: "2026-07-01T00:05:00Z",
  updated_at: "2026-07-01T00:05:00Z",
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

describe("BillsListView", () => {
  beforeEach(() => {
    mockUseBills.mockReset()
    mockUseMarkOverdueBills.mockReset()
    mockUseMarkOverdueBills.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMarkOverdueBills>)
  })

  it("renders an empty state when there are no bills", () => {
    mockBills({ data: { bills: [], total: 0, page: 1, limit: 20 } })
    render(<BillsListView />)
    expect(screen.getByText(/no bills found/i)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockBills({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(<BillsListView />)
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it("renders bills with IDR amount, room label and status", () => {
    mockBills({ data: { bills: [bill], total: 1, page: 1, limit: 20 } })
    render(<BillsListView />)
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument()
    expect(screen.getByText(/A-01 · Kamar Depan/)).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText("Unpaid")).toBeInTheDocument()
  })

  it("passes the billing month filter into the query", () => {
    mockBills({ data: { bills: [bill], total: 1, page: 1, limit: 20 } })
    render(<BillsListView />)
    fireEvent.change(screen.getByLabelText(/filter by billing month/i), {
      target: { value: "2026-08" },
    })
    const lastCall = mockUseBills.mock.calls.at(-1)?.[0]
    expect(lastCall).toMatchObject({ billing_month: "2026-08", page: 1 })
  })

  it("triggers mark-overdue from the confirmation dialog", () => {
    const mutate = vi.fn()
    mockUseMarkOverdueBills.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useMarkOverdueBills>)
    mockBills({ data: { bills: [bill], total: 1, page: 1, limit: 20 } })
    render(<BillsListView />)
    fireEvent.click(screen.getByRole("button", { name: /mark overdue/i }))
    const dialog = screen.getByRole("alertdialog")
    fireEvent.click(
      within(dialog).getByRole("button", { name: /mark overdue/i })
    )
    expect(mutate).toHaveBeenCalled()
  })
})
