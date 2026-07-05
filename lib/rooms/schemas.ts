import * as v from "valibot"

// Room form validation. Forms are uncontrolled (FormData → all values arrive as
// strings), so numeric fields are coerced and validated here. No `owner_id` is
// ever part of a room payload — owner identity is derived server-side.

// Statuses an owner may set directly. `reserved` and `occupied` are system-managed
// (set during onboarding / first payment) and are not offered on the create form.
export const ROOM_CREATE_STATUSES = ["available", "maintenance", "inactive"] as const
// The full set of statuses, allowed when editing an existing room.
export const ROOM_STATUSES = [
  "available",
  "reserved",
  "occupied",
  "maintenance",
  "inactive",
] as const

// Display labels for each status — shared by the badge, filter and form.
export const ROOM_STATUS_LABEL: Record<(typeof ROOM_STATUSES)[number], string> =
  {
    available: "Available",
    reserved: "Reserved",
    occupied: "Occupied",
    maintenance: "Maintenance",
    inactive: "Inactive",
  }

const roomNumber = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Room number is required")
)

const roomName = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Room name is required")
)

// Whole-rupiah integer. Coerces the string form value, rejecting blanks,
// non-numbers, fractions and non-positive amounts.
const monthlyRent = v.pipe(
  v.string(),
  v.trim(),
  v.nonEmpty("Monthly rent is required"),
  v.transform((value) => Number(value)),
  v.number("Enter a valid amount"),
  v.check((n) => Number.isFinite(n), "Enter a valid amount"),
  v.integer("Monthly rent must be a whole number"),
  v.minValue(1, "Monthly rent must be greater than zero")
)

// Notes come from a textarea and may be blank; keep as a trimmed string.
const notes = v.optional(v.pipe(v.string(), v.trim()), "")

export const roomCreateSchema = v.object({
  room_number: roomNumber,
  room_name: roomName,
  monthly_rent: monthlyRent,
  status: v.picklist(ROOM_CREATE_STATUSES, "Select a status"),
  notes,
})

export const roomUpdateSchema = v.object({
  room_number: roomNumber,
  room_name: roomName,
  monthly_rent: monthlyRent,
  status: v.picklist(ROOM_STATUSES, "Select a status"),
  notes,
})

export type RoomCreateInput = v.InferOutput<typeof roomCreateSchema>
export type RoomUpdateInput = v.InferOutput<typeof roomUpdateSchema>
