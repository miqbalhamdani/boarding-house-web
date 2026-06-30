"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RoomForm } from "@/components/rooms/room-form";
import { useRoom } from "@/hooks/rooms/use-room";
import { useUpdateRoom } from "@/hooks/rooms/use-update-room";

export default function EditRoomPage() {
  const params = useParams<{ id: string }>();
  const { data: room, isPending, isError, error } = useRoom(params.id);
  const update = useUpdateRoom(params.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <Link
          href={`/rooms/${params.id}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to room
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit room</h1>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load room</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : isPending ? (
        <div className="grid gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !room ? (
        <Alert>
          <AlertTitle>Room not found</AlertTitle>
          <AlertDescription>This room may have been removed.</AlertDescription>
        </Alert>
      ) : (
        <RoomForm
          mode="edit"
          defaultValues={{
            room_number: room.room_number,
            room_name: room.room_name,
            monthly_rent: room.monthly_rent,
            status: room.status,
            notes: room.notes ?? undefined,
          }}
          onSubmit={(input) => update.mutate(input)}
          isPending={update.isPending}
          error={update.error}
        />
      )}
    </div>
  );
}
