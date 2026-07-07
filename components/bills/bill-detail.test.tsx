import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { BillDetail } from "@/components/bills/bill-detail"
import { useBill } from "@/hooks/use-bills"
import { ApiClientError } from "@/lib/api/types"
import type { Bill } from "@/services/bills"

vi.mock("@/hooks/use-bills", () => ({
  useBill: vi.fn(),
}))

// The record-payment dialog mounts inside the detail view and calls this hook on
// render; stub it so the test needs no QueryClientProvider.
vi.mock("@/hooks/use-payments", () => ({
  useRecordManualPayment: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}))

const mockUseBill = vi.mocked(useBill)

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

function mockBill(state: Partial<ReturnType<typeof useBill>>) {
  mockUseBill.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...state,
  } as ReturnType<typeof useBill>)
}

describe("BillDetail", () => {
  beforeEach(() => {
    mockUseBill.mockReset()
  })

  it("shows a not-found state on a 404", () => {
    mockBill({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "Not found"),
    })
    render(<BillDetail id="b1" />)
    expect(screen.getByText(/bill not found/i)).toBeInTheDocument()
  })

  it("renders bill info with formatted amount and status", () => {
    mockBill({ data: bill })
    render(<BillDetail id="b1" />)
    expect(
      screen.getByRole("heading", { name: /budi santoso/i })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Rp\s?2\.000\.000/).length).toBeGreaterThan(0)
    expect(screen.getByText("A-01 · Kamar Depan")).toBeInTheDocument()
    expect(screen.getAllByText("Unpaid").length).toBeGreaterThan(0)
  })

  it("renders a back link to the bills list", () => {
    mockBill({ data: bill })
    render(<BillDetail id="b1" />)
    expect(
      screen.getByRole("link", { name: /back to bills/i })
    ).toHaveAttribute("href", "/owner/bills")
  })
})
