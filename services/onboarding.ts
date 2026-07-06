import { apiFetch } from "@/lib/api/client"
import type { AssignRoomInput } from "@/lib/onboarding/schemas"

export type AssignRoomResult = {
  room_assignment_id: string
  first_bill_id: string
  tenant_status: string
  room_status: string
}

export function assignRoom(input: AssignRoomInput) {
  return apiFetch<AssignRoomResult>("/owner/onboarding/assign-room", {
    method: "POST",
    body: input,
    kind: "owner",
  })
}

export function cancelOnboarding(roomAssignmentId: string) {
  // The cancel response carries only a top-level `message` (no `data`), so there
  // is nothing to unwrap — resolves to undefined on success.
  return apiFetch<void>(`/owner/onboarding/${roomAssignmentId}/cancel`, {
    method: "POST",
    kind: "owner",
  })
}
