"use client"

import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import Link from "next/link"
import {
  AlertTriangleIcon,
  EllipsisVerticalIcon,
  ReceiptTextIcon,
} from "lucide-react"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
import { DataPagination } from "@/components/general/data-pagination"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTenantBills } from "@/hooks/use-tenant"
import { useTenantAuthGuard } from "@/hooks/use-tenant-auth-guard"
import { errorMessage } from "@/lib/api/errors"
import { BILL_STATUSES, BILL_STATUS_LABEL } from "@/lib/bills/schemas"
import { formatIDR } from "@/lib/format"
import type { Bill, BillStatus } from "@/services/bills"

const PAGE_SIZE = 20
const ALL_STATUSES = "all"

// YYYY-MM → "July 2026".
function formatMonth(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

// YYYY-MM-DD → "10 July 2026".
function formatDueDate(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function BillRowActions({ bill }: { bill: Bill }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground data-[state=open]:bg-muted"
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Open menu for this bill</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem asChild>
            <Link href={`/tenant/bills/${bill.id}`}>View</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function buildColumns(): ColumnDef<Bill>[] {
  return [
    {
      accessorKey: "billing_month",
      header: "Billing month",
      cell: ({ row }) => (
        <Link
          href={`/tenant/bills/${row.original.id}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {formatMonth(row.original.billing_month)}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatIDR(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Due date",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatDueDate(row.original.due_date)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <BillStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <BillRowActions bill={row.original} />,
    },
  ]
}

export function TenantBillsList() {
  const [status, setStatus] = useState<BillStatus | "">("")
  const [page, setPage] = useState(1)

  const query = useTenantBills({ page, limit: PAGE_SIZE, status })
  useTenantAuthGuard(query.error)

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const bills = query.data?.bills ?? []

  // Filtering and pagination are server-side; the table renders the current page.
  const columns = useMemo(() => buildColumns(), [])
  const table = useReactTable({
    data: bills,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Snap back if the current page falls out of range after a filter change.
  if (page > totalPages) {
    setPage(totalPages)
  }

  const hasFilters = Boolean(status)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">My bills</h1>
        <p className="text-muted-foreground text-base">
          Your monthly rent bills
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status === "" ? ALL_STATUSES : status}
          onValueChange={(value) => {
            setStatus(value === ALL_STATUSES ? "" : (value as BillStatus))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
            {BILL_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {BILL_STATUS_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button
            variant="ghost"
            onClick={() => {
              setStatus("")
              setPage(1)
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {query.isPending ? (
        <div className="overflow-hidden rounded-xl border">
          <div className="flex h-11 items-center gap-4 border-b bg-muted/30 px-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="ml-auto size-8 rounded-md" />
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <AlertTriangleIcon className="size-10 text-muted-foreground" />
          <p className="text-base text-muted-foreground">
            {errorMessage(query.error)}
          </p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <ReceiptTextIcon className="size-10 text-muted-foreground" />
          <p className="text-lg font-medium">No bills found</p>
          <p className="text-base text-muted-foreground">
            {hasFilters
              ? "Try adjusting your filter."
              : "You have no bills yet. New monthly rent bills will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="h-11 text-sm font-semibold text-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5 text-base">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            itemLabel={{ singular: "bill", plural: "bills" }}
          />
        </>
      )}
    </div>
  )
}
