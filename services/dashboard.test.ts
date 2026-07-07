import { beforeEach, describe, expect, it, vi } from "vitest"

import { getDashboardSummary } from "@/services/dashboard"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("dashboard service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("requests the summary for the given month", () => {
    getDashboardSummary("2026-07")
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/owner/dashboard/summary?month=2026-07",
      { method: "GET", kind: "owner" }
    )
  })

  it("omits the month param when empty or blank", () => {
    getDashboardSummary("  ")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/dashboard/summary", {
      method: "GET",
      kind: "owner",
    })

    getDashboardSummary()
    expect(mockApiFetch).toHaveBeenLastCalledWith("/owner/dashboard/summary", {
      method: "GET",
      kind: "owner",
    })
  })
})
