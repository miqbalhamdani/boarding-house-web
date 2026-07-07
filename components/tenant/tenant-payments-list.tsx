"use client"

import { useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { AlertTriangleIcon, BanknoteIcon } from "lucide-react"

import { PaymentSourceBadge } from "@/components/payments/payment-source-badge"
import { DataPagination } from "@/components/general/data-pagination"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTenantPayments } from "@/hooks/use-tenant"
import { useTenantAuthGuard } from "@/hooks/use-tenant-auth-guard"
import { errorMessage } from "@/lib/api/errors"
import { PAYMENT_METHOD_LABEL } from "@/lib/payments/schemas"
import { formatIDR } from "@/lib/format"
import type { Payment } from "@/services/payments"

const PAGE_SIZE = 20

// YYYY-MM → "July 2026".
function formatMonth(iso?: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

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

function buildColumns(): ColumnDef<Payment>[] {
  return [
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
      header: "Payment date",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatPaymentDate(row.original.payment_date)}
        </span>
      ),
    },
  ]
}

export function TenantPaymentsList() {
  const [page, setPage] = useState(1)

  const query = useTenantPayments({ page, limit: PAGE_SIZE })
  useTenantAuthGuard(query.error)

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const payments = query.data?.payments ?? []

  const columns = useMemo(() => buildColumns(), [])
  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (page > totalPages) {
    setPage(totalPages)
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">Payment history</h1>
        <p className="text-muted-foreground text-base">
          Your successful payments
        </p>
      </div>

      {query.isPending ? (
        <div className="overflow-hidden rounded-xl border">
          <div className="flex h-11 items-center gap-4 border-b bg-muted/30 px-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-4 w-28" />
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0"
            >
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="ml-auto h-5 w-32" />
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
          <p className="text-lg font-medium">No payments yet</p>
          <p className="text-base text-muted-foreground">
            Your payments will appear here once a bill is paid.
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
