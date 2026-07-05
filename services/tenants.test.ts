import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
} from "@/services/tenants"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("tenants service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("builds a query string with only the provided params", () => {
    listTenants({ page: 2, limit: 20, status: "active", search: "budi" })
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/owner/tenants?page=2&limit=20&status=active&search=budi",
      { method: "GET", kind: "owner" }
    )
  })

  it("omits empty status and search from the query string", () => {
    listTenants({ page: 1, limit: 20, status: "", search: "  " })
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/tenants?page=1&limit=20", {
      method: "GET",
      kind: "owner",
    })
  })

  it("sends create payloads as an owner-scoped POST", () => {
    const input = {
      full_name: "Budi Santoso",
      phone_number: "081234567890",
      email: "budi@example.com",
      identity_number: "317300001",
      emergency_contact_name: "Siti",
      emergency_contact_phone: "081299988877",
      password: undefined,
    }
    createTenant(input)
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/tenants", {
      method: "POST",
      body: input,
      kind: "owner",
    })
  })

  it("targets the tenant id for detail, update and delete", () => {
    getTenant("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/tenants/abc", {
      method: "GET",
      kind: "owner",
    })

    updateTenant("abc", {
      full_name: "Budi Santoso",
      phone_number: "081200000000",
      email: "budi@example.com",
      identity_number: "317300001",
      emergency_contact_name: "Siti Aminah",
      emergency_contact_phone: "081299988877",
      password: undefined,
    })
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/owner/tenants/abc",
      expect.objectContaining({ method: "PATCH", kind: "owner" })
    )

    deleteTenant("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/tenants/abc", {
      method: "DELETE",
      kind: "owner",
    })
  })
})
