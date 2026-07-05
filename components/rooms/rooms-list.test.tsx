import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { RoomsListView } from "@/components/rooms/rooms-list"
import { useDeleteRoom, useRooms } from "@/hooks/use-rooms"
import { ApiClientError } from "@/lib/api/types"
import type { Room } from "@/services/rooms"

vi.mock("@/hooks/use-rooms", () => ({
  useRooms: vi.fn(),
  useDeleteRoom: vi.fn(),
  // The list and its table render (closed) RoomFormDialogs, which import these;
  // stubbed so the module mock exposes them even though closed dialogs never call them.
  useCreateRoom: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateRoom: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRoom: vi.fn(() => ({ data: undefined, isPending: true, isError: false })),
}))

// RoomsTable (rendered in the data state) navigates rows via useRouter.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const mockUseRooms = vi.mocked(useRooms)
const mockUseDeleteRoom = vi.mocked(useDeleteRoom)

type RoomsReturn = ReturnType<typeof useRooms>

const room: Room = {
  id: "r1",
  room_number: "101",
  room_name: "Room 101",
  monthly_rent: 2000000,
  status: "available",
  notes: "",
  created_at: "2026-07-01T08:00:00Z",
  updated_at: "2026-07-01T08:00:00Z",
}

function mockRooms(state: Partial<RoomsReturn>) {
  mockUseRooms.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  } as RoomsReturn)
}

describe("RoomsListView", () => {
  beforeEach(() => {
    mockUseRooms.mockReset()
    mockUseDeleteRoom.mockReset()
    mockUseDeleteRoom.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteRoom>)
  })

  it("renders an empty state when there are no rooms", () => {
    mockRooms({ data: { rooms: [], total: 0, page: 1, limit: 20 } })
    render(<RoomsListView />)
    expect(screen.getByText(/no rooms found/i)).toBeInTheDocument()
  })

  it("renders an error state with a retry action", () => {
    const refetch = vi.fn()
    mockRooms({
      isError: true,
      error: new ApiClientError(500, "SERVER_ERROR", "Server exploded"),
      refetch,
    })
    render(<RoomsListView />)
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it("renders rooms with IDR-formatted rent and a row actions menu", () => {
    mockRooms({ data: { rooms: [room], total: 1, page: 1, limit: 20 } })
    render(<RoomsListView />)
    expect(screen.getByText("101")).toBeInTheDocument()
    expect(screen.getByText(/Rp\s?2\.000\.000/)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /open menu for room 101/i })
    ).toBeInTheDocument()
  })

  describe("search", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it("passes the debounced search term into the query", () => {
      mockRooms({ data: { rooms: [room], total: 1, page: 1, limit: 20 } })
      render(<RoomsListView />)
      fireEvent.change(screen.getByLabelText(/search rooms/i), {
        target: { value: "101" },
      })
      act(() => {
        vi.advanceTimersByTime(300)
      })
      const lastCall = mockUseRooms.mock.calls.at(-1)?.[0]
      expect(lastCall).toMatchObject({ search: "101", page: 1 })
    })
  })
})
