"use client"

import * as React from "react"

import { RoomStatusBadge } from "@/components/rooms/room-status-badge"
import { useRooms } from "@/hooks/use-rooms"
import { formatIDR } from "@/lib/format"
import type { Room } from "@/services/rooms"

import { EntityCombobox } from "./entity-combobox"

// Searchable room picker, restricted to available rooms (BR-004). The available
// set is small, so all rooms load once (limit 100) and search filters client-side.
export function RoomCombobox({
  selected,
  onSelect,
  invalid,
}: {
  selected: Room | null
  onSelect: (room: Room | null) => void
  invalid?: boolean
}) {
  const [search, setSearch] = React.useState("")

  const query = useRooms({ status: "available", limit: 100 })
  const rooms = query.data?.rooms ?? []

  const term = search.trim().toLowerCase()
  const filtered = term
    ? rooms.filter((room) =>
        `${room.room_number} ${room.room_name}`.toLowerCase().includes(term)
      )
    : rooms

  return (
    <EntityCombobox<Room>
      name="room_id"
      selected={selected}
      onSelect={onSelect}
      items={filtered}
      getId={(room) => room.id}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isPending}
      isError={query.isError}
      placeholder="Select an available room"
      searchPlaceholder="Search rooms by number or name…"
      emptyText="No available rooms."
      invalid={invalid}
      renderItem={(room) => (
        <span className="flex items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {room.room_number} · {room.room_name}
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {formatIDR(room.monthly_rent)} / month
            </span>
          </span>
          <RoomStatusBadge status={room.status} />
        </span>
      )}
      renderSelected={(room) => (
        <span className="truncate">
          <span className="font-medium">{room.room_number}</span> ·{" "}
          {room.room_name}
        </span>
      )}
    />
  )
}
