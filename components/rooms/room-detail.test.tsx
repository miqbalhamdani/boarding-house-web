import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RoomDetail } from "@/components/rooms/room-detail"
import { useRoom } from "@/hooks/use-rooms"
import { ApiClientError } from "@/lib/api/types"
import type { Room } from "@/services/rooms"

vi.mock("@/hooks/use-rooms", () => ({
  useRoom: vi.fn(),
  // RoomDetail renders a (closed) RoomFormDialog, which imports these; stubbed
  // so the module mock exposes them even though the closed dialog never calls them.
  useCreateRoom: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateRoom: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

const mockUseRoom = vi.mocked(useRoom)

const room: Room = {
  id: "r1",
  room_number: "101",
  room_name: "Room 101",
  monthly_rent: 2000000,
  status: "available",
  notes: "Near front door",
  created_at: "2026-07-01T08:00:00Z",
  updated_at: "2026-07-01T08:00:00Z",
}

function mockRoom(state: Partial<ReturnType<typeof useRoom>>) {
  mockUseRoom.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...state,
  } as ReturnType<typeof useRoom>)
}

describe("RoomDetail", () => {
  beforeEach(() => {
    mockUseRoom.mockReset()
  })

  it("shows a not-found state on a 404", () => {
    mockRoom({
      isError: true,
      error: new ApiClientError(404, "NOT_FOUND", "Not found"),
    })
    render(<RoomDetail id="r1" />)
    expect(screen.getByText(/room not found/i)).toBeInTheDocument()
  })

  it("renders room info with formatted rent", () => {
    mockRoom({ data: room })
    render(<RoomDetail id="r1" />)
    expect(
      screen.getByRole("heading", { name: /room 101/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
  })

  it("renders a back link to the rooms list", () => {
    mockRoom({ data: room })
    render(<RoomDetail id="r1" />)
    expect(
      screen.getByRole("link", { name: /back to rooms/i })
    ).toHaveAttribute("href", "/owner/rooms")
  })
})
