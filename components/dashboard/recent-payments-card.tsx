"use client"

import Link from "next/link"
import { Banknote } from "lucide-react"

import { DashboardListCard } from "@/components/dashboard/dashboard-list-card"
import { PaymentSourceBadge } from "@/components/payments/payment-source-badge"
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
import { formatDateTime, formatIDR } from "@/lib/format"

const PREVIEW_LIMIT = 5

// Compact preview of the most recent successful payments in the selected month
// (the payments endpoint is successful-only and ordered by payment_date desc).
export function RecentPaymentsCard({ month }: { month: string }) {
  const query = usePayments({ month, limit: PREVIEW_LIMIT, page: 1 })
  const payments = query.data?.payments ?? []

  return (
    <DashboardListCard
      title="Recent payments"
      icon={Banknote}
      accent="emerald"
      count={query.data?.total}
      viewAllHref="/owner/payments"
      isPending={query.isPending}
      isError={query.isError}
      isEmpty={payments.length === 0}
      errorText={query.isError ? errorMessage(query.error) : undefined}
      emptyText="No payments recorded for this month yet."
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
                Amount
              </TableHead>
              <TableHead className="text-sm font-semibold text-foreground">
                Source
              </TableHead>
              <TableHead className="text-sm font-semibold text-foreground">
                Paid on
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow
                key={payment.id}
                className="transition-colors hover:bg-muted/50"
              >
                <TableCell className="py-3 text-base">
                  <Link
                    href={`/owner/payments/${payment.id}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {payment.tenant_name || "—"}
                  </Link>
                </TableCell>
                <TableCell className="py-3 text-base tabular-nums">
                  {formatIDR(payment.amount)}
                </TableCell>
                <TableCell className="py-3">
                  <PaymentSourceBadge source={payment.payment_source} />
                </TableCell>
                <TableCell className="py-3 text-base tabular-nums">
                  {formatDateTime(payment.payment_date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardListCard>
  )
}
