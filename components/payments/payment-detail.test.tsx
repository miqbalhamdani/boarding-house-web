import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PaymentDetail } from "@/components/payments/payment-detail"
import { usePayment } from "@/hooks/use-payments"
import { ApiClientError } from "@/lib/api/types"
import type { Payment } from "@/services/payments"

vi.mock("@/hooks/use-payments", () => ({
  usePayment: vi.fn(),
}))

const mockUsePayment = vi.mocked(usePayment)

const payment: Payment = {
  id: "p1",
  bill_id: "b1",
  amount: 2000000,
  payment_source: "manual",
  payment_method: "bank_transfer",
  payment_date: "2026-07-10T10:00:00Z",
  reference_number: "TRX-001",
  notes: "Paid by bank transfer",
  tenant_id: "t1",
  tenant_name: "Budi Santoso",
  room_id: "r1",
  room_number: "A-01",
  room_name: "Kamar Depan",
  billing_month: "2026-07",
  created_at: "2026-07-10T10:00:05Z",
  updated_at: "2026-07-10T10:00:05Z",
}

function mockPayment(state: Partial<ReturnType<typeof usePayment>>) {
  mockUsePayment.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...state,
  } as ReturnType<typeof usePayment>)
}

describe("PaymentDetail", () => {
  beforeEach(() => {
    mockUsePayment.mockReset()
  })

  it("shows a not-found state on a 404", () => {
    mockPayment({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "Not found"),
    })
    render(<PaymentDetail id="p1" />)
    expect(screen.getByText(/payment not found/i)).toBeInTheDocument()
  })

  it("renders payment info with amount, method, source and reference", () => {
    mockPayment({ data: payment })
    render(<PaymentDetail id="p1" />)
    expect(
      screen.getByRole("heading", { name: /budi santoso/i })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Rp\s?2\.000\.000/).length).toBeGreaterThan(0)
    expect(screen.getByText("Bank transfer")).toBeInTheDocument()
    expect(screen.getAllByText("Manual").length).toBeGreaterThan(0)
    expect(screen.getByText("TRX-001")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /view bill/i })
    ).toHaveAttribute("href", "/owner/bills/b1")
  })

  it("renders a back link to the payments list", () => {
    mockPayment({ data: payment })
    render(<PaymentDetail id="p1" />)
    expect(
      screen.getByRole("link", { name: /back to payments/i })
    ).toHaveAttribute("href", "/owner/payments")
  })
})
