import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { TenantDashboard } from "@/components/tenant/tenant-dashboard"
import { useMyRoom } from "@/hooks/use-auth"
import { useTenantBills, useTenantPayments, usePayBill } from "@/hooks/use-tenant"
import { ApiClientError } from "@/lib/api/types"
import type { MyRoom } from "@/services/auth"
import type { Bill } from "@/services/bills"
import type { Payment } from "@/services/payments"

vi.mock("@/hooks/use-auth", () => ({
  useMyRoom: vi.fn(),
}))
vi.mock("@/hooks/use-tenant", () => ({
  useTenantBills: vi.fn(),
  useTenantPayments: vi.fn(),
  usePayBill: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock("@/hooks/use-tenant-auth-guard", () => ({
  useTenantAuthGuard: vi.fn(),
}))

const mockUseMyRoom = vi.mocked(useMyRoom)
const mockUseTenantBills = vi.mocked(useTenantBills)
const mockUseTenantPayments = vi.mocked(useTenantPayments)
const mockUsePayBill = vi.mocked(usePayBill)

const room: MyRoom = {
  room_assignment_id: "ra1",
  room_id: "r1",
  room_number: "A-01",
  monthly_rent: 2000000,
}

const unpaidBill: Bill = {
  id: "b1",
  room_assignment_id: "ra1",
  tenant_id: "t1",
  room_id: "r1",
  billing_month: "2026-07",
  amount: 2000000,
  due_date: "2026-07-10",
  status: "unpaid",
  created_at: "2026-07-01T00:05:00Z",
  updated_at: "2026-07-01T00:05:00Z",
}

const payment: Payment = {
  id: "p1",
  bill_id: "b0",
  amount: 2000000,
  payment_source: "gateway",
  payment_method: "qris",
  payment_date: "2026-06-10T10:00:00Z",
  billing_month: "2026-06",
  created_at: "2026-06-10T10:00:05Z",
  updated_at: "2026-06-10T10:00:05Z",
}

function mockRoom(state: Partial<ReturnType<typeof useMyRoom>>) {
  mockUseMyRoom.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...state,
  } as ReturnType<typeof useMyRoom>)
}

function mockBills(state: Partial<ReturnType<typeof useTenantBills>>) {
  mockUseTenantBills.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as ReturnType<typeof useTenantBills>)
}

function mockPayments(state: Partial<ReturnType<typeof useTenantPayments>>) {
  mockUseTenantPayments.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as ReturnType<typeof useTenantPayments>)
}

describe("TenantDashboard", () => {
  beforeEach(() => {
    mockUseMyRoom.mockReset()
    mockUseTenantBills.mockReset()
    mockUseTenantPayments.mockReset()
    mockUsePayBill.mockReset()
    mockUsePayBill.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof usePayBill>)
    // Sensible defaults; individual tests override.
    mockRoom({ data: room })
    mockBills({ data: { bills: [], total: 0, page: 1, limit: 5 } })
    mockPayments({ data: { payments: [], total: 0, page: 1, limit: 3 } })
  })

  it("shows the assigned room number and monthly rent", () => {
    render(<TenantDashboard />)
    expect(screen.getByText(/room a-01/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
  })

  it("surfaces the outstanding bill with a Pay Now action", () => {
    mockBills({ data: { bills: [unpaidBill], total: 1, page: 1, limit: 5 } })
    render(<TenantDashboard />)
    expect(screen.getByRole("button", { name: /pay now/i })).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /view bill/i })
    ).toHaveAttribute("href", "/tenant/bills/b1")
  })

  it("shows an all-caught-up message when there is no outstanding bill", () => {
    render(<TenantDashboard />)
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /pay now/i })
    ).not.toBeInTheDocument()
  })

  it("lists recent payments and links to the full history", () => {
    mockPayments({ data: { payments: [payment], total: 1, page: 1, limit: 3 } })
    render(<TenantDashboard />)
    expect(
      screen.getByRole("link", { name: /view all/i })
    ).toHaveAttribute("href", "/tenant/payments")
    expect(screen.getByText("Gateway")).toBeInTheDocument()
  })

  it("shows an empty payments message when there are none", () => {
    render(<TenantDashboard />)
    expect(screen.getByText(/no payments yet/i)).toBeInTheDocument()
  })

  it("shows a not-found room card when the tenant has no assignment", () => {
    mockRoom({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "No assignment"),
    })
    render(<TenantDashboard />)
    expect(screen.getByText(/no room assigned yet/i)).toBeInTheDocument()
  })
})
