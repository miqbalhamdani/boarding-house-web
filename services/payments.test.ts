import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  buildPaymentsQuery,
  getPayment,
  listPayments,
  recordManualPayment,
} from "@/services/payments"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("payments service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("builds a query string with only the provided params", () => {
    expect(
      buildPaymentsQuery({
        page: 2,
        limit: 20,
        tenant_id: "t1",
        month: "2026-07",
        source: "manual",
      })
    ).toBe("?page=2&limit=20&tenant_id=t1&month=2026-07&source=manual")
  })

  it("omits empty month and source from the query string", () => {
    listPayments({ page: 1, limit: 20, month: "  ", source: "" })
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/payments?page=1&limit=20", {
      method: "GET",
      kind: "owner",
    })
  })

  it("returns an empty query string when no params carry a value", () => {
    expect(buildPaymentsQuery({})).toBe("")
  })

  it("targets the payment id for detail", () => {
    getPayment("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/payments/abc", {
      method: "GET",
      kind: "owner",
    })
  })

  it("posts the manual payment payload without an owner_id", () => {
    recordManualPayment({
      bill_id: "b1",
      amount: 2000000,
      payment_method: "bank_transfer",
      payment_date: "2026-07-10T10:00:00.000Z",
      reference_number: "TRX-001",
      notes: undefined,
    })
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/payments/manual", {
      method: "POST",
      body: {
        bill_id: "b1",
        amount: 2000000,
        payment_method: "bank_transfer",
        payment_date: "2026-07-10T10:00:00.000Z",
        reference_number: "TRX-001",
        notes: undefined,
      },
      kind: "owner",
    })
  })
})
