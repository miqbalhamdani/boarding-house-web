"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import type { RoomCreateInput, RoomUpdateInput } from "@/lib/rooms/schemas"
import {
  createRoom,
  deleteRoom,
  getRoom,
  listRooms,
  updateRoom,
  type Room,
  type RoomListParams,
} from "@/services/rooms"

const ROOMS_KEY = ["rooms"] as const

// Retry only transient failures (network / 5xx) once. Auth (401/403) and
// not-found (404) errors won't fix themselves on retry.
function retryTransient(count: number, error: unknown): boolean {
  const transient =
    !(error instanceof ApiClientError) ||
    error.status === 0 ||
    error.status >= 500
  return transient && count < 1
}

export function useRooms(params: RoomListParams) {
  return useQuery({
    queryKey: [...ROOMS_KEY, "list", params],
    queryFn: () => listRooms(params),
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: [...ROOMS_KEY, "detail", id],
    queryFn: () => getRoom(id),
    enabled: Boolean(id),
    retry: retryTransient,
  })
}

// When `options.onSuccess` is provided (e.g. a modal wanting to close in place),
// it runs instead of the default navigate-to-detail. The success toast and cache
// invalidation always run.
export function useCreateRoom(options?: { onSuccess?: (room: Room) => void }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RoomCreateInput) => createRoom(input),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY })
      toast.success("Room created")
      if (options?.onSuccess) options.onSuccess(room)
      else router.push(`/owner/rooms/${room.id}`)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useUpdateRoom(
  id: string,
  options?: { onSuccess?: (room: Room) => void }
) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RoomUpdateInput) => updateRoom(id, input),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY })
      toast.success("Room updated")
      if (options?.onSuccess) options.onSuccess(room)
      else router.push(`/owner/rooms/${id}`)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}

export function useDeleteRoom() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMS_KEY })
      toast.success("Room deleted")
      router.push("/owner/rooms")
    },
    onError: (error) => toast.error(errorMessage(error)),
  })
}
