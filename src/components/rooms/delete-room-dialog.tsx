"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useDeleteRoom } from "@/hooks/rooms/use-delete-room";
import type { Room } from "@/services/rooms";

/** Statuses that must not be deleted (BR: occupied/reserved rooms in use). */
const UNDELETABLE = new Set<Room["status"]>(["occupied", "reserved"]);

export interface DeleteRoomDialogProps {
  room: Pick<Room, "id" | "room_number" | "status">;
  /** Called after a successful delete (e.g. to navigate away from detail). */
  onDeleted?: () => void;
}

/**
 * Confirm + delete a room. Delete is disabled (with a tooltip reason) for
 * occupied/reserved rooms; the backend remains the source of truth. The
 * confirm button is disabled while the request is in flight to block double
 * submits.
 */
export function DeleteRoomDialog({ room, onDeleted }: DeleteRoomDialogProps) {
  const remove = useDeleteRoom();
  const blocked = UNDELETABLE.has(room.status);

  if (blocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button variant="destructive" size="lg" disabled>
                Delete
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Occupied or reserved rooms cannot be deleted.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  function handleConfirm() {
    remove.mutate(room.id, {
      onSuccess: () => onDeleted?.(),
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="lg">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete room {room.room_number}?</AlertDialogTitle>
          <AlertDialogDescription>
            This room will be removed from your list. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg" disabled={remove.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="lg"
            onClick={handleConfirm}
            disabled={remove.isPending}
          >
            {remove.isPending ? "Deleting…" : "Delete room"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
