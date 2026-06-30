import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listRooms, type RoomListParams } from "@/services/rooms";

/** Root key for every rooms query, used for broad invalidation. */
export const roomsRootKey = ["owner", "rooms"] as const;

export const roomsKey = (params: RoomListParams) =>
  [...roomsRootKey, "list", params] as const;

/** Paginated, filterable list of the owner's rooms. */
export function useRooms(params: RoomListParams = {}) {
  return useQuery({
    queryKey: roomsKey(params),
    queryFn: () => listRooms(params),
    placeholderData: keepPreviousData,
  });
}
