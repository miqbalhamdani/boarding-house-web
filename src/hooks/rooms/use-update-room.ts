import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import type { RoomFormInput } from "@/lib/validation/rooms";
import { updateRoom } from "@/services/rooms";
import { roomsRootKey } from "./use-rooms";

export function useUpdateRoom(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: RoomFormInput) => updateRoom(id, input),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: roomsRootKey });
      toast.success(`Room ${room.room_number} updated`);
      router.push(`/rooms/${id}`);
    },
    onError: (error) => {
      toast.error((error as ApiError).message);
    },
  });
}
