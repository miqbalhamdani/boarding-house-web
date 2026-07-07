import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DashboardView } from "@/components/dashboard/dashboard-view"
import { useBills } from "@/hooks/use-bills"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { usePayments } from "@/hooks/use-payments"

vi.mock("@/hooks/use-dashboard", () => ({ useDashboardSummary: vi.fn() }))
vi.mock("@/hooks/use-bills", () => ({ useBills: vi.fn() }))
vi.mock("@/hooks/use-payments", () => ({ usePayments: vi.fn() }))

const mockUseSummary = vi.mocked(useDashboardSummary)
const mockUseBills = vi.mocked(useBills)
const mockUsePayments = vi.mocked(usePayments)

const summary = {
  total_rooms: 10,
  available_rooms: 3,
  occupied_rooms: 7,
  active_tenants: 7,
  unpaid_bills: 2,
  overdue_bills: 1,
  gateway_pending_bills: 1,
  paid_bills_this_month: 5,
  collected_amount_this_month: 10000000,
}

// Local-time YYYY-MM, matching the component's default (not UTC — the two can
// differ near month boundaries).
function localCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function queryState(data: unknown) {
  return {
    data,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }
}

describe("DashboardView", () => {
  beforeEach(() => {
    mockUseSummary.mockReset()
    mockUseBills.mockReset()
    mockUsePayments.mockReset()
    mockUseSummary.mockReturnValue(
      queryState(summary) as unknown as ReturnType<typeof useDashboardSummary>
    )
    mockUseBills.mockReturnValue(
      queryState({
        bills: [],
        total: 0,
        page: 1,
        limit: 5,
      }) as unknown as ReturnType<typeof useBills>
    )
    mockUsePayments.mockReturnValue(
      queryState({
        payments: [],
        total: 0,
        page: 1,
        limit: 5,
      }) as unknown as ReturnType<typeof usePayments>
    )
  })

  it("defaults the month filter to the current month", () => {
    render(<DashboardView />)
    const expected = localCurrentMonth()
    expect(screen.getByLabelText(/select summary month/i)).toHaveValue(expected)
    expect(mockUseSummary.mock.calls.at(-1)?.[0]).toBe(expected)
  })

  it("refetches the summary and recent payments for a newly picked month", () => {
    render(<DashboardView />)
    fireEvent.change(screen.getByLabelText(/select summary month/i), {
      target: { value: "2026-06" },
    })
    expect(mockUseSummary.mock.calls.at(-1)?.[0]).toBe("2026-06")
    expect(mockUsePayments.mock.calls.at(-1)?.[0]).toMatchObject({
      month: "2026-06",
    })
  })

  it("falls back to the current month when the input is cleared", () => {
    render(<DashboardView />)
    fireEvent.change(screen.getByLabelText(/select summary month/i), {
      target: { value: "" },
    })
    const expected = localCurrentMonth()
    expect(mockUseSummary.mock.calls.at(-1)?.[0]).toBe(expected)
  })

  it("renders all four preview lists", () => {
    render(<DashboardView />)
    // The bill titles also appear as summary-card labels, hence getAllByText.
    expect(screen.getAllByText("Unpaid bills").length).toBeGreaterThan(1)
    expect(screen.getAllByText("Overdue bills").length).toBeGreaterThan(1)
    expect(screen.getAllByText("Gateway pending").length).toBeGreaterThan(1)
    expect(screen.getByText("Recent payments")).toBeInTheDocument()
  })
})
