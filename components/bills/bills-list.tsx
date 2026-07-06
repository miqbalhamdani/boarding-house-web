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
  ClockAlertIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  PlusIcon,
  ReceiptTextIcon,
} from "lucide-react"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
import { GenerateBillsDialog } from "@/components/bills/generate-bills-dialog"
import { ConfirmDialog } from "@/components/general/confirm-dialog"
import { DataPagination } from "@/components/general/data-pagination"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { useBills, useMarkOverdueBills } from "@/hooks/use-bills"
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
            <Link href={`/owner/bills/${bill.id}`}>View</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function roomLabel(bill: Bill): string {
  const parts = [bill.room_number, bill.room_name].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

function buildColumns(): ColumnDef<Bill>[] {
  return [
    {
      accessorKey: "tenant_name",
      header: "Tenant",
      cell: ({ row }) => (
        <Link
          href={`/owner/bills/${row.original.id}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {row.original.tenant_name || "—"}
        </Link>
      ),
    },
    {
      id: "room",
      header: "Room",
      cell: ({ row }) => roomLabel(row.original),
    },
    {
      accessorKey: "billing_month",
      header: "Billing month",
      cell: ({ row }) => formatMonth(row.original.billing_month),
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
        <span className="tabular-nums">{formatDueDate(row.original.due_date)}</span>
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

export function BillsListView() {
  const [status, setStatus] = useState<BillStatus | "">("")
  const [billingMonth, setBillingMonth] = useState("")
  const [page, setPage] = useState(1)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [markOverdueOpen, setMarkOverdueOpen] = useState(false)
  const markOverdue = useMarkOverdueBills({
    onSuccess: () => setMarkOverdueOpen(false),
  })

  const query = useBills({
    page,
    limit: PAGE_SIZE,
    status,
    billing_month: billingMonth,
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const bills = query.data?.bills ?? []

  // Filtering and pagination are handled server-side, so the table only renders
  // the current page's rows.
  const columns = useMemo(() => buildColumns(), [])
  const table = useReactTable({
    data: bills,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // If the current page falls out of range (e.g. after a filter change),
  // snap back to the last populated page. Adjusting state during render
  // (guarded) is React's recommended pattern here over an effect.
  if (page > totalPages) {
    setPage(totalPages)
  }

  const hasFilters = Boolean(billingMonth || status)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-muted-foreground text-base">
            Monthly rent bills for your workspace
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setMarkOverdueOpen(true)}
          >
            <ClockAlertIcon />
            Mark overdue
          </Button>
          <Button size="lg" onClick={() => setGenerateOpen(true)}>
            <PlusIcon />
            Generate bills
          </Button>
        </div>
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
        <Input
          type="month"
          value={billingMonth}
          onChange={(event) => {
            setBillingMonth(event.target.value)
            setPage(1)
          }}
          className="w-48"
          aria-label="Filter by billing month"
        />
        {hasFilters ? (
          <Button
            variant="ghost"
            onClick={() => {
              setStatus("")
              setBillingMonth("")
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
            <Skeleton className="h-4 w-24" />
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
              <Skeleton className="h-5 w-24" />
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
              ? "Try adjusting your filters."
              : "Bills are created during onboarding and generated monthly. Use Generate bills to create this month's bills now."}
          </p>
          {!hasFilters ? (
            <Button onClick={() => setGenerateOpen(true)}>
              <FileTextIcon />
              Generate bills
            </Button>
          ) : null}
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

      <GenerateBillsDialog open={generateOpen} onOpenChange={setGenerateOpen} />

      <ConfirmDialog
        open={markOverdueOpen}
        onOpenChange={(open) => {
          if (!markOverdue.isPending) setMarkOverdueOpen(open)
        }}
        title="Mark overdue bills?"
        description="Any unpaid bill whose due date has passed will be moved to overdue. This is normally done automatically each day."
        confirmLabel="Mark overdue"
        pendingLabel="Updating…"
        pending={markOverdue.isPending}
        onConfirm={() => markOverdue.mutate()}
      />
    </div>
  )
}
