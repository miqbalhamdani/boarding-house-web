import * as v from "valibot";

/** Allowed room statuses (BR-003). */
export const ROOM_STATUSES = [
  "available",
  "reserved",
  "occupied",
  "maintenance",
  "inactive",
] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

/** Human-readable labels for each status. */
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  occupied: "Occupied",
  maintenance: "Maintenance",
  inactive: "Inactive",
};

/**
 * Room create/edit form. Mirrors `POST /owner/rooms` and `PATCH /owner/rooms/{id}`.
 * `monthly_rent` is coerced from the form string input before validation, so
 * an empty or non-numeric value surfaces as a clear "required" message rather
 * than a NaN.
 */
export const RoomFormSchema = v.object({
  room_number: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Room number is required"),
  ),
  room_name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty("Room name is required"),
  ),
  monthly_rent: v.pipe(
    v.number("Monthly rent is required"),
    v.integer("Monthly rent must be a whole number"),
    v.minValue(1, "Monthly rent must be greater than 0"),
  ),
  status: v.picklist(ROOM_STATUSES, "Select a valid status"),
  notes: v.optional(v.pipe(v.string(), v.trim())),
});
export type RoomFormInput = v.InferOutput<typeof RoomFormSchema>;

export function safeParseRoomForm(input: unknown) {
  return v.safeParse(RoomFormSchema, input);
}

// Reuse the shared field-error flattener from the auth schema module.
export { fieldErrors } from "@/lib/validation/auth";
