"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { DeleteRoomDialog } from "@/components/rooms/delete-room-dialog";
import { useRoom } from "@/hooks/rooms/use-room";
import { formatDate, formatIDR } from "@/lib/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-lg">{value}</dd>
    </div>
  );
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: room, isPending, isError, error } = useRoom(params.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/rooms"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to rooms
      </Link>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load room</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : isPending ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="grid gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : !room ? (
        <Alert>
          <AlertTitle>Room not found</AlertTitle>
          <AlertDescription>
            This room may have been removed.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Room {room.room_number}
              </h1>
              <RoomStatusBadge status={room.status} />
            </div>
            <div className="flex gap-2">
              <Button asChild size="lg" variant="outline">
                <Link href={`/rooms/${room.id}/edit`}>Edit</Link>
              </Button>
              <DeleteRoomDialog
                room={room}
                onDeleted={() => router.push("/rooms")}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Room information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Room number" value={room.room_number} />
                <Field label="Room name" value={room.room_name} />
                <Field
                  label="Monthly rent"
                  value={formatIDR(room.monthly_rent)}
                />
                <Field
                  label="Status"
                  value={<RoomStatusBadge status={room.status} />}
                />
                <Field
                  label="Notes"
                  value={room.notes?.trim() ? room.notes : "—"}
                />
                <Field label="Created" value={formatDate(room.created_at)} />
              </dl>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
