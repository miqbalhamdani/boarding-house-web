"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, DoorOpen } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { DataTable } from "@/components/data-table";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { DeleteRoomDialog } from "@/components/rooms/delete-room-dialog";
import { useRooms } from "@/hooks/rooms/use-rooms";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatIDR } from "@/lib/format";
import {
  ROOM_STATUSES,
  ROOM_STATUS_LABELS,
  type RoomStatus,
} from "@/lib/validation/rooms";
import type { Room } from "@/services/rooms";

const PAGE_SIZE = 20;
const ALL = "all";

/** Friendly labels for the column-visibility menu. */
const COLUMN_LABELS: Record<string, string> = {
  room_name: "Name",
  monthly_rent: "Monthly rent",
  status: "Status",
};

export default function RoomsListPage() {
  const [statusFilter, setStatusFilter] = useState<RoomStatus | typeof ALL>(
    ALL,
  );
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(searchInput, 300);

  const params = useMemo(
    () => ({
      status: statusFilter === ALL ? undefined : statusFilter,
      search: search.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [statusFilter, search, page],
  );

  const { data, isPending, isError, error, isPlaceholderData } =
    useRooms(params);

  const rooms = data?.rooms ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = useMemo<ColumnDef<Room>[]>(
    () => [
      {
        accessorKey: "room_number",
        header: "Room no.",
        enableHiding: false,
        cell: ({ row }) => (
          <Link
            href={`/rooms/${row.original.id}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.original.room_number}
          </Link>
        ),
      },
      { accessorKey: "room_name", header: "Name" },
      {
        accessorKey: "monthly_rent",
        header: "Monthly rent",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatIDR(row.original.monthly_rent)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <RoomStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/rooms/${row.original.id}/edit`}>Edit</Link>
            </Button>
            <DeleteRoomDialog room={row.original} triggerSize="sm" />
          </div>
        ),
      },
    ],
    [],
  );

  function handleStatusChange(value: string) {
    setStatusFilter(value as RoomStatus | typeof ALL);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Manage the rooms in your workspace.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/rooms/new">Add room</Link>
        </Button>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load rooms</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={rooms}
        isLoading={isPending}
        emptyMessage={
          <div className="flex flex-col items-center gap-4 py-6">
            <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <DoorOpen className="size-7" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="font-medium text-foreground">No rooms found</p>
              <p className="text-base text-muted-foreground">
                Add your first room to get started.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/rooms/new">Add room</Link>
            </Button>
          </div>
        }
        toolbar={(table) => (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Room number or name"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status-filter" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    {ROOM_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ROOM_STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal className="size-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(Boolean(value))
                      }
                    >
                      {COLUMN_LABELS[column.id] ?? column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        footer={
          total > 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {total} room
                {total === 1 ? "" : "s"}
              </p>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isPlaceholderData}
                    >
                      Previous
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= totalPages || isPlaceholderData}
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null
        }
      />
    </div>
  );
}
