import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { createRoom } from "@/services/rooms";
import { roomsRootKey } from "./use-rooms";

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: roomsRootKey });
      toast.success(`Room ${room.room_number} created`);
      router.push("/rooms");
    },
    onError: (error) => {
      toast.error((error as ApiError).message);
    },
  });
}
