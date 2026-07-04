import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createRoom,
  deleteRoom,
  getRoom,
  listRooms,
  updateRoom,
} from "@/services/rooms"

vi.mock("@/lib/api/client", () => ({ apiFetch: vi.fn() }))

import { apiFetch } from "@/lib/api/client"

const mockApiFetch = vi.mocked(apiFetch)

describe("rooms service", () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
    mockApiFetch.mockResolvedValue(undefined as never)
  })

  it("builds a query string with only the provided params", () => {
    listRooms({ page: 2, limit: 20, status: "available", search: "101" })
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/owner/rooms?page=2&limit=20&status=available&search=101",
      { method: "GET", kind: "owner" }
    )
  })

  it("omits empty status and search from the query string", () => {
    listRooms({ page: 1, limit: 20, status: "", search: "  " })
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/rooms?page=1&limit=20", {
      method: "GET",
      kind: "owner",
    })
  })

  it("sends create payloads as an owner-scoped POST", () => {
    const input = {
      room_number: "101",
      room_name: "Room 101",
      monthly_rent: 2000000,
      status: "available" as const,
      notes: "",
    }
    createRoom(input)
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/rooms", {
      method: "POST",
      body: input,
      kind: "owner",
    })
  })

  it("targets the room id for detail, update and delete", () => {
    getRoom("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/rooms/abc", {
      method: "GET",
      kind: "owner",
    })

    updateRoom("abc", {
      room_number: "101",
      room_name: "Room 101",
      monthly_rent: 2500000,
      status: "occupied",
      notes: "",
    })
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/owner/rooms/abc",
      expect.objectContaining({ method: "PATCH", kind: "owner" })
    )

    deleteRoom("abc")
    expect(mockApiFetch).toHaveBeenCalledWith("/owner/rooms/abc", {
      method: "DELETE",
      kind: "owner",
    })
  })
})
