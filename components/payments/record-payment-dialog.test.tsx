import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog"
import { useRecordManualPayment } from "@/hooks/use-payments"
import type { Payment } from "@/services/payments"

vi.mock("@/hooks/use-payments", () => ({
  useRecordManualPayment: vi.fn(),
}))

const mockUseRecord = vi.mocked(useRecordManualPayment)

// Captured so tests can invoke the success callback the component passes in.
let capturedOnSuccess: ((payment: Payment) => void) | undefined

function mockRecord(overrides: Record<string, unknown> = {}) {
  const mutate = vi.fn()
  mockUseRecord.mockImplementation((options) => {
    capturedOnSuccess = options?.onSuccess
    return {
      mutate,
      isPending: false,
      error: null,
      ...overrides,
    } as unknown as ReturnType<typeof useRecordManualPayment>
  })
  return mutate
}

function renderDialog(props: Partial<React.ComponentProps<typeof RecordPaymentDialog>> = {}) {
  return render(
    <RecordPaymentDialog
      billId="b1"
      amount={2000000}
      tenantName="Budi Santoso"
      open
      onOpenChange={vi.fn()}
      {...props}
    />
  )
}

describe("RecordPaymentDialog", () => {
  beforeEach(() => {
    mockUseRecord.mockReset()
    capturedOnSuccess = undefined
  })

  it("shows the fixed full amount and pins bill_id + amount as hidden fields", () => {
    mockRecord()
    renderDialog()

    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
    expect(screen.getByText(/partial payments are not allowed/i)).toBeInTheDocument()
    // The dialog portals to document.body, so query the whole document.
    expect(document.querySelector('input[name="bill_id"]')).toHaveValue("b1")
    expect(document.querySelector('input[name="amount"]')).toHaveValue("2000000")
  })

  it("blocks submission when no payment method is selected", () => {
    const mutate = mockRecord()
    renderDialog()

    fireEvent.click(screen.getByRole("button", { name: /record payment/i }))

    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText(/select a payment method/i)).toBeInTheDocument()
  })

  it("disables the submit button while a request is in flight", () => {
    mockRecord({ isPending: true })
    renderDialog()
    expect(screen.getByRole("button", { name: /recording/i })).toBeDisabled()
  })

  it("swaps to a success panel once the payment is recorded", () => {
    mockRecord()
    renderDialog()

    act(() => {
      capturedOnSuccess?.({ id: "p1" } as Payment)
    })

    expect(screen.getByText(/payment recorded/i)).toBeInTheDocument()
    expect(screen.getByText(/the bill is now marked paid/i)).toBeInTheDocument()
  })
})
