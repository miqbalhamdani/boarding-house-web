"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RoomForm } from "@/components/rooms/room-form";
import { useCreateRoom } from "@/hooks/rooms/use-create-room";

export default function NewRoomPage() {
  const create = useCreateRoom();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <Link
          href="/rooms"
          className="text-base text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to rooms
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Add room</h1>
      </div>
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <RoomForm
            mode="create"
            onSubmit={(input) => create.mutate(input)}
            isPending={create.isPending}
            error={create.error}
          />
        </CardContent>
      </Card>
    </div>
  );
}
