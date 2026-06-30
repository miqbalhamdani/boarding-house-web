"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        cell: ({ row }) => formatIDR(row.original.monthly_rent),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <RoomStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/rooms/${row.original.id}/edit`}>Edit</Link>
            </Button>
            <DeleteRoomDialog room={row.original} />
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: rooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load rooms</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-muted-foreground"
                >
                  No rooms found. Add your first room to get started.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {total} room{total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isPlaceholderData}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || isPlaceholderData}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
