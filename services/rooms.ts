import { apiFetch } from "@/lib/api/client"
import type { RoomCreateInput, RoomUpdateInput } from "@/lib/rooms/schemas"

export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "maintenance"
  | "inactive"

export type Room = {
  id: string
  room_number: string
  room_name: string
  // Money is an integer amount in IDR (whole rupiah).
  monthly_rent: number
  status: RoomStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type RoomListParams = {
  page?: number
  limit?: number
  status?: RoomStatus | ""
  search?: string
}

export type RoomListResult = {
  rooms: Room[]
  total: number
  page: number
  limit: number
}

// Serialises only the params that carry a value so empty status/search are
// omitted from the query string entirely.
function buildRoomsQuery(params: RoomListParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set("page", String(params.page))
  if (params.limit) query.set("limit", String(params.limit))
  if (params.status) query.set("status", params.status)
  const search = params.search?.trim()
  if (search) query.set("search", search)
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export function listRooms(params: RoomListParams = {}) {
  return apiFetch<RoomListResult>(`/owner/rooms${buildRoomsQuery(params)}`, {
    method: "GET",
    kind: "owner",
  })
}

export function getRoom(id: string) {
  return apiFetch<Room>(`/owner/rooms/${id}`, { method: "GET", kind: "owner" })
}

export function createRoom(input: RoomCreateInput) {
  return apiFetch<Room>("/owner/rooms", {
    method: "POST",
    body: input,
    kind: "owner",
  })
}

export function updateRoom(id: string, input: RoomUpdateInput) {
  return apiFetch<Room>(`/owner/rooms/${id}`, {
    method: "PATCH",
    body: input,
    kind: "owner",
  })
}

export function deleteRoom(id: string) {
  // The delete response carries only a top-level `message` (no `data`), so
  // there is nothing to unwrap — resolves to undefined on success.
  return apiFetch<void>(`/owner/rooms/${id}`, {
    method: "DELETE",
    kind: "owner",
  })
}
