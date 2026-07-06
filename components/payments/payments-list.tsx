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
  BanknoteIcon,
  EllipsisVerticalIcon,
} from "lucide-react"

import { PaymentSourceBadge } from "@/components/payments/payment-source-badge"
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
import { usePayments } from "@/hooks/use-payments"
import { errorMessage } from "@/lib/api/errors"
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_SOURCES,
  PAYMENT_SOURCE_LABEL,
} from "@/lib/payments/schemas"
import { formatIDR } from "@/lib/format"
import type { Payment, PaymentSource } from "@/services/payments"

const PAGE_SIZE = 20
const ALL_SOURCES = "all"

// RFC3339 → "10 July 2026, 17.00".
function formatPaymentDate(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function roomLabel(payment: Payment): string {
  const parts = [payment.room_number, payment.room_name].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

function PaymentRowActions({ payment }: { payment: Payment }) {
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
            <span className="sr-only">Open menu for this payment</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem asChild>
            <Link href={`/owner/payments/${payment.id}`}>View</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function buildColumns(): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: "tenant_name",
      header: "Tenant",
      cell: ({ row }) => (
        <Link
          href={`/owner/payments/${row.original.id}`}
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
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatIDR(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Method",
      cell: ({ row }) => PAYMENT_METHOD_LABEL[row.original.payment_method],
    },
    {
      accessorKey: "payment_source",
      header: "Source",
      cell: ({ row }) => (
        <PaymentSourceBadge source={row.original.payment_source} />
      ),
    },
    {
      accessorKey: "payment_date",
      header: "Paid on",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatPaymentDate(row.original.payment_date)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <PaymentRowActions payment={row.original} />,
    },
  ]
}

export function PaymentsListView() {
  const [source, setSource] = useState<PaymentSource | "">("")
  const [month, setMonth] = useState("")
  const [page, setPage] = useState(1)

  const query = usePayments({
    page,
    limit: PAGE_SIZE,
    month,
    source,
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const payments = query.data?.payments ?? []

  // Filtering and pagination are handled server-side, so the table only renders
  // the current page's rows.
  const columns = useMemo(() => buildColumns(), [])
  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // If the current page falls out of range (e.g. after a filter change), snap
  // back to the last populated page. Adjusting state during render (guarded) is
  // React's recommended pattern here over an effect.
  if (page > totalPages) {
    setPage(totalPages)
  }

  const hasFilters = Boolean(month || source)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground text-base">
          Successful payments recorded for your workspace
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={source === "" ? ALL_SOURCES : source}
          onValueChange={(value) => {
            setSource(value === ALL_SOURCES ? "" : (value as PaymentSource))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48" aria-label="Filter by source">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SOURCES}>All sources</SelectItem>
            {PAYMENT_SOURCES.map((value) => (
              <SelectItem key={value} value={value}>
                {PAYMENT_SOURCE_LABEL[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="month"
          value={month}
          onChange={(event) => {
            setMonth(event.target.value)
            setPage(1)
          }}
          className="w-48"
          aria-label="Filter by payment month"
        />
        {hasFilters ? (
          <Button
            variant="ghost"
            onClick={() => {
              setSource("")
              setMonth("")
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
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
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
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <BanknoteIcon className="size-10 text-muted-foreground" />
          <p className="text-lg font-medium">No payments found</p>
          <p className="text-base text-muted-foreground">
            {hasFilters
              ? "Try adjusting your filters."
              : "Payments appear here once a bill is paid. Record a manual payment from a bill's detail page, or wait for a gateway payment to settle."}
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
            itemLabel={{ singular: "payment", plural: "payments" }}
          />
        </>
      )}
    </div>
  )
}
