"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { useState } from "react"

import { RoomFormDialog } from "@/components/rooms/room-form"
import { RoomStatusBadge } from "@/components/rooms/room-status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoom } from "@/hooks/use-rooms"
import { ApiClientError } from "@/lib/api/types"
import { errorMessage } from "@/lib/api/errors"
import { formatIDR } from "@/lib/format"
import type { RoomStatus } from "@/services/rooms"

// Static UI copy describing what each status means operationally, so status is
// not conveyed by the badge colour alone.
const STATUS_HELP: Record<RoomStatus, string> = {
  available: "Ready to assign a tenant.",
  reserved: "Held for a tenant awaiting first payment.",
  occupied: "A tenant is currently living here.",
  maintenance: "Temporarily unavailable while being serviced.",
  inactive: "Hidden from availability and not rentable.",
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium">{value}</dd>
    </div>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("id-ID")
}

export function RoomDetail({ id }: { id: string }) {
  const room = useRoom(id)
  const [editOpen, setEditOpen] = useState(false)

  if (room.isPending) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (room.isError || !room.data) {
    const notFound =
      room.error instanceof ApiClientError && room.error.status === 404
    return (
      <div className="px-4 py-6 lg:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-lg font-medium">
            {notFound ? "Room not found" : "Could not load room"}
          </p>
          {!notFound && (
            <p className="text-base text-muted-foreground">
              {errorMessage(room.error)}
            </p>
          )}
          <Button asChild variant="outline">
            <Link href="/owner/rooms">Back to rooms</Link>
          </Button>
        </div>
      </div>
    )
  }

  const data = room.data

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/owner/rooms">Rooms</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Room {data.room_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room {data.room_number}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="lg">
            <Link href="/owner/rooms">
              <ArrowLeftIcon />
              Back to rooms
            </Link>
          </Button>
          <Button size="lg" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        </div>
      </div>

      {/* Highlight band — the two most operationally important facts. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Monthly rent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatIDR(data.monthly_rent)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <RoomStatusBadge status={data.status} />
            </div>
            <p className="text-base text-muted-foreground">
              {STATUS_HELP[data.status]}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details + record metadata. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Room information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow label="Room number" value={data.room_number} />
              <InfoRow label="Room name" value={data.room_name || "—"} />
              <InfoRow label="Notes" value={data.notes || "—"} />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow label="Created" value={formatDate(data.created_at)} />
              <InfoRow label="Updated" value={formatDate(data.updated_at)} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Future sections — labeled placeholders. No data is fetched here; the
          tenant and billing modules are not built yet. */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed py-10 text-center">
              <p className="text-base font-medium">No tenant assigned yet</p>
              <p className="text-base text-muted-foreground">
                Tenant assignments will appear here once the tenant module is
                available.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bill history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed py-10 text-center">
              <p className="text-base font-medium">No bills yet</p>
              <p className="text-base text-muted-foreground">
                Bills for this room will appear here once the billing module is
                available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <RoomFormDialog
        mode="edit"
        id={data.id}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
