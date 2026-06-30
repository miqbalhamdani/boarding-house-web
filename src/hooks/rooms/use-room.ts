import { useQuery } from "@tanstack/react-query";
import { getRoom } from "@/services/rooms";
import { roomsRootKey } from "./use-rooms";

export const roomKey = (id: string) =>
  [...roomsRootKey, "detail", id] as const;

/** A single room by id. Disabled until an id is available. */
export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: roomKey(id ?? ""),
    queryFn: () => getRoom(id as string),
    enabled: Boolean(id),
  });
}
