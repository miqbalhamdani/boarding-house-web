import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { RoomForm } from "@/components/rooms/room-form"
import { useCreateRoom, useRoom, useUpdateRoom } from "@/hooks/use-rooms"
import { ApiClientError } from "@/lib/api/types"

vi.mock("@/hooks/use-rooms", () => ({
  useCreateRoom: vi.fn(),
  useUpdateRoom: vi.fn(),
  useRoom: vi.fn(),
}))

const mockUseCreateRoom = vi.mocked(useCreateRoom)
const mockUseUpdateRoom = vi.mocked(useUpdateRoom)
const mockUseRoom = vi.mocked(useRoom)

type CreateReturn = ReturnType<typeof useCreateRoom>

function setupCreate(overrides: Partial<CreateReturn> = {}) {
  const mutate = vi.fn()
  mockUseCreateRoom.mockReturnValue({
    mutate,
    isPending: false,
    error: null,
    ...overrides,
  } as CreateReturn)
  mockUseUpdateRoom.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useUpdateRoom>)
  render(<RoomForm mode="create" />)
  return { mutate }
}

describe("RoomForm (create)", () => {
  beforeEach(() => {
    mockUseCreateRoom.mockReset()
    mockUseUpdateRoom.mockReset()
    mockUseRoom.mockReset()
  })

  it("blocks submit and shows validation errors when required fields are empty", () => {
    const { mutate } = setupCreate()
    fireEvent.submit(screen.getByRole("button", { name: /create room/i }))
    expect(screen.getByText(/room number is required/i)).toBeInTheDocument()
    expect(screen.getByText(/monthly rent is required/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it("submits a coerced numeric monthly_rent to the mutation", () => {
    const { mutate } = setupCreate()
    fireEvent.change(screen.getByLabelText(/room number/i), {
      target: { value: "101" },
    })
    fireEvent.change(screen.getByLabelText(/room name/i), {
      target: { value: "Room 101" },
    })
    fireEvent.change(screen.getByLabelText(/monthly rent/i), {
      target: { value: "2000000" },
    })
    fireEvent.submit(screen.getByRole("button", { name: /create room/i }))
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        room_number: "101",
        room_name: "Room 101",
        monthly_rent: 2000000,
        status: "available",
      })
    )
  })

  it("disables the submit button while pending", () => {
    setupCreate({ isPending: true })
    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled()
  })

  it("shows a server field error (e.g. duplicate room number)", () => {
    setupCreate({
      error: new ApiClientError(409, "CONFLICT", "Conflict", {
        room_number: "Room number already exists",
      }),
    })
    expect(
      screen.getByText(/room number already exists/i)
    ).toBeInTheDocument()
  })
})
