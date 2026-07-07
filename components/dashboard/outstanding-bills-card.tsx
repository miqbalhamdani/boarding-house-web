"use client"

import Link from "next/link"
import { Clock, FileText, type LucideIcon, TriangleAlert } from "lucide-react"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
import { DashboardListCard } from "@/components/dashboard/dashboard-list-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBills } from "@/hooks/use-bills"
import { errorMessage } from "@/lib/api/errors"
import { formatIDR } from "@/lib/format"
import type { Bill, BillStatus } from "@/services/bills"

const PREVIEW_LIMIT = 5

// Icon + accent per status, matching the summary cards and status badges so the
// "needs attention" lists (overdue / gateway pending) read at a glance.
const STATUS_ICON: Partial<
  Record<BillStatus, { icon: LucideIcon; accent: "muted" | "rose" | "sky" }>
> = {
  unpaid: { icon: FileText, accent: "muted" },
  overdue: { icon: TriangleAlert, accent: "rose" },
  gateway_pending: { icon: Clock, accent: "sky" },
}

function roomLabel(bill: Bill): string {
  const parts = [bill.room_number, bill.room_name].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

// Compact preview of the owner's outstanding bills for a single status. Reuses
// the shared bills list endpoint (owner-scoped server-side) and links out to the
// full, filtered Bills page.
export function OutstandingBillsCard({
  title,
  status,
  emptyText,
}: {
  title: string
  status: BillStatus
  emptyText: string
}) {
  const query = useBills({ status, limit: PREVIEW_LIMIT, page: 1 })
  const bills = query.data?.bills ?? []
  const style = STATUS_ICON[status]

  return (
    <DashboardListCard
      title={title}
      icon={style?.icon}
      accent={style?.accent}
      count={query.data?.total}
      viewAllHref={`/owner/bills?status=${status}`}
      isPending={query.isPending}
      isError={query.isError}
      isEmpty={bills.length === 0}
      errorText={query.isError ? errorMessage(query.error) : undefined}
      emptyText={emptyText}
      onRetry={() => query.refetch()}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-sm font-semibold text-foreground">
                Tenant
              </TableHead>
              <TableHead className="text-sm font-semibold text-foreground">
                Room
              </TableHead>
              <TableHead className="text-sm font-semibold text-foreground">
                Amount
              </TableHead>
              <TableHead className="text-sm font-semibold text-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id} className="transition-colors hover:bg-muted/50">
                <TableCell className="py-3 text-base">
                  <Link
                    href={`/owner/bills/${bill.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {bill.tenant_name || "—"}
                  </Link>
                </TableCell>
                <TableCell className="py-3 text-base">{roomLabel(bill)}</TableCell>
                <TableCell className="py-3 text-base tabular-nums">
                  {formatIDR(bill.amount)}
                </TableCell>
                <TableCell className="py-3">
                  <BillStatusBadge status={bill.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardListCard>
  )
}
