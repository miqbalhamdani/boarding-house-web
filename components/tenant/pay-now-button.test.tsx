import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PayNowButton } from "@/components/tenant/pay-now-button"
import { usePayBill } from "@/hooks/use-tenant"

vi.mock("@/hooks/use-tenant", () => ({
  usePayBill: vi.fn(),
}))

const mockUsePayBill = vi.mocked(usePayBill)

function mockPay(state: Partial<ReturnType<typeof usePayBill>>) {
  mockUsePayBill.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    ...state,
  } as unknown as ReturnType<typeof usePayBill>)
}

describe("PayNowButton", () => {
  beforeEach(() => {
    mockUsePayBill.mockReset()
    mockPay({})
  })

  it("shows Pay Now for an unpaid bill and triggers the mutation", () => {
    const mutate = vi.fn()
    mockPay({ mutate })
    render(<PayNowButton billId="b1" status="unpaid" />)
    const button = screen.getByRole("button", { name: /pay now/i })
    fireEvent.click(button)
    expect(mutate).toHaveBeenCalledWith("b1")
  })

  it("labels a gateway_pending bill as Continue payment", () => {
    render(<PayNowButton billId="b1" status="gateway_pending" />)
    expect(
      screen.getByRole("button", { name: /continue payment/i })
    ).toBeInTheDocument()
  })

  it("disables the button while a checkout is being opened (no double submit)", () => {
    mockPay({ isPending: true })
    render(<PayNowButton billId="b1" status="unpaid" />)
    expect(screen.getByRole("button")).toBeDisabled()
    expect(screen.getByText(/opening checkout/i)).toBeInTheDocument()
  })

  it("does not render a pay button for a paid bill", () => {
    render(<PayNowButton billId="b1" status="paid" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByText(/already paid/i)).toBeInTheDocument()
  })

  it("does not render a pay button for a cancelled bill", () => {
    render(<PayNowButton billId="b1" status="cancelled" />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByText(/cancelled/i)).toBeInTheDocument()
  })
})
