import { beforeEach, describe, expect, it, vi } from "vitest"

import { assignRoom, cancelOnboarding } from "@/services/onboarding"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("onboarding service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("posts the assign-room payload to the owner-scoped endpoint", () => {
    const input = {
      tenant_id: "tenant-1",
      room_id: "room-1",
      start_date: "2026-07-10",
      monthly_rent: 2000000,
      payment_due_day: 10,
    }
    assignRoom(input)
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/onboarding/assign-room", {
      method: "POST",
      body: input,
      kind: "owner",
    })
  })

  it("does not send an owner_id in the assign-room body", () => {
    assignRoom({
      tenant_id: "tenant-1",
      room_id: "room-1",
      start_date: "2026-07-10",
      monthly_rent: 2000000,
      payment_due_day: 10,
    })
    const [, options] = mockApiFetch.mock.calls[0]
    expect(options?.body).not.toHaveProperty("owner_id")
  })

  it("targets the room assignment id for cancel", () => {
    cancelOnboarding("ra-1")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/onboarding/ra-1/cancel", {
      method: "POST",
      kind: "owner",
    })
  })
})
