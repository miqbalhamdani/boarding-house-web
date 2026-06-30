import { apiFetch, type ApiResponse } from "@/lib/api/client";
import type { RoomFormInput, RoomStatus } from "@/lib/validation/rooms";

/** A room as returned by the owner room endpoints. */
export interface Room {
  id: string;
  room_number: string;
  room_name: string;
  /** Integer rupiah amount. */
  monthly_rent: number;
  status: RoomStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/** Query params for `GET /owner/rooms`. */
export interface RoomListParams {
  status?: RoomStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/** Paginated list payload returned under `data` (matches the Bruno spec). */
export interface PaginatedRooms {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
}

function buildRoomQuery(params: RoomListParams): string {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/**
 * List the authenticated owner's rooms. `owner_id` is never sent — the API
 * derives it from the owner token (see {@link apiFetch}).
 */
export async function listRooms(
  params: RoomListParams = {},
): Promise<PaginatedRooms> {
  const res = await apiFetch<ApiResponse<PaginatedRooms>>(
    `/owner/rooms${buildRoomQuery(params)}`,
    { role: "owner" },
  );
  return res.data;
}

export async function getRoom(id: string): Promise<Room> {
  const res = await apiFetch<ApiResponse<Room>>(`/owner/rooms/${id}`, {
    role: "owner",
  });
  return res.data;
}

export async function createRoom(input: RoomFormInput): Promise<Room> {
  const res = await apiFetch<ApiResponse<Room>>("/owner/rooms", {
    method: "POST",
    body: input,
    role: "owner",
  });
  return res.data;
}

export async function updateRoom(
  id: string,
  input: RoomFormInput,
): Promise<Room> {
  const res = await apiFetch<ApiResponse<Room>>(`/owner/rooms/${id}`, {
    method: "PATCH",
    body: input,
    role: "owner",
  });
  return res.data;
}

export async function deleteRoom(id: string): Promise<void> {
  await apiFetch<ApiResponse<unknown> | null>(`/owner/rooms/${id}`, {
    method: "DELETE",
    role: "owner",
  });
}
