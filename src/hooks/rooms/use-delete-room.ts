import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { deleteRoom } from "@/services/rooms";
import { roomsRootKey } from "./use-rooms";

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsRootKey });
      toast.success("Room deleted");
    },
    onError: (error) => {
      toast.error((error as ApiError).message);
    },
  });
}
