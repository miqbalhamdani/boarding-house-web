import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  buildBillsQuery,
  generateMonthlyBills,
  getBill,
  listBills,
  markOverdueBills,
} from "@/services/bills"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("bills service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("builds a query string with only the provided params", () => {
    expect(
      buildBillsQuery({
        page: 2,
        limit: 20,
        status: "overdue",
        billing_month: "2026-07",
        tenant_id: "t1",
        room_id: "r1",
      })
    ).toBe(
      "?page=2&limit=20&status=overdue&billing_month=2026-07&tenant_id=t1&room_id=r1"
    )
  })

  it("omits empty status and billing_month from the query string", () => {
    listBills({ page: 1, limit: 20, status: "", billing_month: "  " })
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/bills?page=1&limit=20", {
      method: "GET",
      kind: "owner",
    })
  })

  it("returns an empty query string when no params carry a value", () => {
    expect(buildBillsQuery({})).toBe("")
  })

  it("targets the bill id for detail", () => {
    getBill("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/bills/abc", {
      method: "GET",
      kind: "owner",
    })
  })

  it("posts the billing month to generate-monthly", () => {
    generateMonthlyBills({ billing_month: "2026-07" })
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/bills/generate-monthly", {
      method: "POST",
      body: { billing_month: "2026-07" },
      kind: "owner",
    })
  })

  it("posts mark-overdue with no body", () => {
    markOverdueBills()
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/bills/mark-overdue", {
      method: "POST",
      kind: "owner",
    })
  })
})
