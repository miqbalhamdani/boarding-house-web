import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AssignRoomDialog } from "@/components/onboarding/assign-room-dialog"
import { useAssignRoom, useCancelOnboarding } from "@/hooks/use-onboarding"
import { ApiClientError } from "@/lib/api/types"
import type { AssignRoomResult } from "@/services/onboarding"
import type { Room } from "@/services/rooms"
import type { Tenant } from "@/services/tenants"

vi.mock("@/hooks/use-onboarding", () => ({
  useAssignRoom: vi.fn(),
  useCancelOnboarding: vi.fn(),
}))

// The dialog is opened for a known tenant (we are on that tenant's detail page),
// so there is no tenant picker — the tenant id travels via a hidden input. The
// room combobox (Popover + cmdk) is stubbed to a hidden input + a button that
// selects a fixed room, keeping the test on the dialog's own logic (validation
// merge, payload coercion, pending state, success panel).
const TENANT: Tenant = {
  id: "tenant-1",
  full_name: "Budi Santoso",
  phone_number: "081234567890",
  email: "budi@example.com",
  identity_number: "317300001",
  emergency_contact_name: "Siti",
  emergency_contact_phone: "081299988877",
  status: "pending_payment",
  has_portal_access: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

const ROOM: Room = {
  id: "room-1",
  room_number: "101",
  room_name: "Room 101",
  monthly_rent: 2000000,
  status: "available",
  notes: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

vi.mock("@/components/onboarding/room-combobox", () => ({
  RoomCombobox: ({
    selected,
    onSelect,
  }: {
    selected: Room | null
    onSelect: (room: Room | null) => void
  }) => (
    <div>
      <input type="hidden" name="room_id" value={selected?.id ?? ""} readOnly />
      <button type="button" onClick={() => onSelect(ROOM)}>
        pick room
      </button>
    </div>
  ),
}))

const mockUseAssignRoom = vi.mocked(useAssignRoom)
const mockUseCancelOnboarding = vi.mocked(useCancelOnboarding)

type AssignReturn = ReturnType<typeof useAssignRoom>

function setup(overrides: Partial<AssignReturn> = {}) {
  const mutate = vi.fn()
  mockUseAssignRoom.mockReturnValue({
    mutate,
    isPending: false,
    error: null,
    ...overrides,
  } as AssignReturn)
  mockUseCancelOnboarding.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  } as unknown as ReturnType<typeof useCancelOnboarding>)
  render(
    <AssignRoomDialog tenant={TENANT} open onOpenChange={vi.fn()} />
  )
  return { mutate }
}

describe("AssignRoomDialog", () => {
  beforeEach(() => {
    mockUseAssignRoom.mockReset()
    mockUseCancelOnboarding.mockReset()
  })

  it("has no tenant picker — the tenant is fixed by the page", () => {
    setup()
    expect(
      screen.queryByRole("button", { name: /select a tenant/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/select a tenant/i)).not.toBeInTheDocument()
  })

  it("blocks submit and shows a validation error when no room is picked", () => {
    const { mutate } = setup()
    fireEvent.submit(screen.getByRole("button", { name: /assign room/i }))
    expect(screen.getByText(/select a room/i)).toBeInTheDocument()
    expect(mutate).not.toHaveBeenCalled()
  })

  it("prefills monthly rent from the selected room (BR-012 snapshot)", () => {
    setup()
    fireEvent.click(screen.getByRole("button", { name: /pick room/i }))
    expect(screen.getByLabelText(/monthly rent/i)).toHaveValue(2000000)
  })

  it("submits a coerced payload with the fixed tenant id and no owner_id", () => {
    const { mutate } = setup()
    fireEvent.click(screen.getByRole("button", { name: /pick room/i }))
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-07-10" },
    })
    fireEvent.change(screen.getByLabelText(/payment due day/i), {
      target: { value: "10" },
    })
    fireEvent.submit(screen.getByRole("button", { name: /assign room/i }))

    expect(mutate).toHaveBeenCalledTimes(1)
    const payload = mutate.mock.calls[0][0]
    expect(payload).toEqual({
      tenant_id: "tenant-1",
      room_id: "room-1",
      start_date: "2026-07-10",
      monthly_rent: 2000000,
      payment_due_day: 10,
    })
    expect(payload).not.toHaveProperty("owner_id")
  })

  it("disables the submit button while the assignment is pending", () => {
    setup({ isPending: true })
    expect(screen.getByRole("button", { name: /assigning/i })).toBeDisabled()
  })

  it("shows a server field error returned by the API", () => {
    setup({
      error: new ApiClientError(409, "CONFLICT", "Conflict", {
        room_id: "Room already has an active assignment",
      }),
    })
    expect(
      screen.getByText(/room already has an active assignment/i)
    ).toBeInTheDocument()
  })

  it("renders the success summary after assigning, with cancel + done actions", () => {
    // Make the mocked mutation drive the onSuccess callback the dialog passes in.
    mockUseAssignRoom.mockImplementation(
      (options?: { onSuccess?: (result: AssignRoomResult) => void }) =>
        ({
          mutate: () =>
            options?.onSuccess?.({
              room_assignment_id: "ra-1",
              first_bill_id: "bill-1",
              tenant_status: "pending_payment",
              room_status: "reserved",
            }),
          isPending: false,
          error: null,
        }) as unknown as AssignReturn
    )
    mockUseCancelOnboarding.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCancelOnboarding>)

    render(<AssignRoomDialog tenant={TENANT} open onOpenChange={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: /pick room/i }))
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-07-10" },
    })
    fireEvent.change(screen.getByLabelText(/payment due day/i), {
      target: { value: "10" },
    })
    fireEvent.submit(screen.getByRole("button", { name: /assign room/i }))

    expect(screen.getByText(/tenant assigned/i)).toBeInTheDocument()
    expect(screen.getByText(/budi santoso/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /cancel onboarding/i })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument()
  })
})
