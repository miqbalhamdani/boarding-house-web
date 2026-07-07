import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  buildTenantBillsQuery,
  buildTenantPaymentsQuery,
  getMyProfile,
  getTenantBill,
  listTenantBills,
  listTenantPayments,
  payBill,
} from "@/services/tenant"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("tenant service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("builds a bills query string with only the provided params", () => {
    expect(
      buildTenantBillsQuery({ page: 2, limit: 20, status: "unpaid" })
    ).toBe("?page=2&limit=20&status=unpaid")
  })

  it("omits an empty status from the bills query string", () => {
    listTenantBills({ page: 1, limit: 20, status: "" })
    expect(mockApiFetch).toHaveBeenCalledWith("/tenant/bills?page=1&limit=20", {
      method: "GET",
      kind: "tenant",
    })
  })

  it("returns an empty bills query string when no params carry a value", () => {
    expect(buildTenantBillsQuery({})).toBe("")
  })

  it("builds a payments query string with only the provided params", () => {
    expect(buildTenantPaymentsQuery({ page: 3, limit: 20 })).toBe(
      "?page=3&limit=20"
    )
  })

  it("targets the tenant bill id for detail with a tenant token", () => {
    getTenantBill("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/tenant/bills/abc", {
      method: "GET",
      kind: "tenant",
    })
  })

  it("reads the tenant profile with a tenant token", () => {
    getMyProfile()
    expect(mockApiFetch).toHaveBeenCalledWith("/tenant/me", {
      method: "GET",
      kind: "tenant",
    })
  })

  it("lists tenant payments with a tenant token", () => {
    listTenantPayments({ page: 1, limit: 20 })
    expect(mockApiFetch).toHaveBeenCalledWith("/tenant/payments?page=1&limit=20", {
      method: "GET",
      kind: "tenant",
    })
  })

  it("pays a bill without ever sending an amount (BR-022)", () => {
    payBill("b1")
    expect(mockApiFetch).toHaveBeenCalledWith("/tenant/bills/b1/pay", {
      method: "POST",
      body: {},
      kind: "tenant",
    })
    const body = mockApiFetch.mock.calls.at(-1)?.[1]?.body as
      | Record<string, unknown>
      | undefined
    expect(body).not.toHaveProperty("amount")
  })

  it("includes the provider only when one is given", () => {
    payBill("b1", "midtrans")
    expect(mockApiFetch).toHaveBeenCalledWith("/tenant/bills/b1/pay", {
      method: "POST",
      body: { provider: "midtrans" },
      kind: "tenant",
    })
  })
})
