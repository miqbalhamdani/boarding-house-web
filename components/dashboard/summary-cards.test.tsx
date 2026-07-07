import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SummaryCards } from "@/components/dashboard/summary-cards"
import type { DashboardSummary } from "@/services/dashboard"

const summary: DashboardSummary = {
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

describe("SummaryCards", () => {
  it("renders every metric with counts and an IDR collected amount", () => {
    render(
      <SummaryCards summary={summary} isPending={false} isError={false} />
    )
    expect(screen.getByText("Total rooms")).toBeInTheDocument()
    expect(screen.getByText("Overdue bills")).toBeInTheDocument()
    expect(screen.getByText("Gateway pending")).toBeInTheDocument()
    expect(screen.getByText("Paid this month")).toBeInTheDocument()
    expect(screen.getByText("Collected this month")).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?10\.000\.000/)).toBeInTheDocument()
  })

  it("groups metrics under section headings", () => {
    render(
      <SummaryCards summary={summary} isPending={false} isError={false} />
    )
    expect(
      screen.getByRole("heading", { name: /occupancy & tenants/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /bills & collection/i })
    ).toBeInTheDocument()
  })

  it("renders skeletons while pending", () => {
    const { container } = render(
      <SummaryCards summary={undefined} isPending isError={false} />
    )
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
    expect(screen.queryByText("Total rooms")).not.toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const onRetry = vi.fn()
    render(
      <SummaryCards
        summary={undefined}
        isPending={false}
        isError
        errorText="Boom"
        onRetry={onRetry}
      />
    )
    expect(screen.getByText("Boom")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
