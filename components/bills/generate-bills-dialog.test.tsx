import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { GenerateBillsDialog } from "@/components/bills/generate-bills-dialog"
import { useGenerateMonthlyBills } from "@/hooks/use-bills"

vi.mock("@/hooks/use-bills", () => ({
  useGenerateMonthlyBills: vi.fn(),
}))

const mockUseGenerate = vi.mocked(useGenerateMonthlyBills)

function mockGenerate(overrides: Record<string, unknown> = {}) {
  const mutate = vi.fn()
  mockUseGenerate.mockReturnValue({
    mutate,
    isPending: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useGenerateMonthlyBills>)
  return mutate
}

describe("GenerateBillsDialog", () => {
  beforeEach(() => {
    mockUseGenerate.mockReset()
  })

  it("submits the selected billing month", () => {
    const mutate = mockGenerate()
    render(<GenerateBillsDialog open onOpenChange={vi.fn()} />)

    const input = screen.getByLabelText(/billing month/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: "2026-08" } })
    fireEvent.click(screen.getByRole("button", { name: /generate bills/i }))

    expect(mutate).toHaveBeenCalledWith({ billing_month: "2026-08" })
  })

  it("blocks submission when the month is empty and marks the field invalid", () => {
    const mutate = mockGenerate()
    render(<GenerateBillsDialog open onOpenChange={vi.fn()} />)

    const input = screen.getByLabelText(/billing month/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: /generate bills/i }))

    expect(mutate).not.toHaveBeenCalled()
    expect(input).toHaveAttribute("aria-invalid", "true")
  })

  it("disables the submit button while a request is in flight", () => {
    mockGenerate({ isPending: true })
    render(<GenerateBillsDialog open onOpenChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled()
  })
})
