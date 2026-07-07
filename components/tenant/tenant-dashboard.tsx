"use client"

import Link from "next/link"
import { AlertTriangleIcon } from "lucide-react"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
import { PaymentSourceBadge } from "@/components/payments/payment-source-badge"
import { PayNowButton } from "@/components/tenant/pay-now-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyRoom } from "@/hooks/use-auth"
import { useTenantBills, useTenantPayments } from "@/hooks/use-tenant"
import { useTenantAuthGuard } from "@/hooks/use-tenant-auth-guard"
import { ApiClientError } from "@/lib/api/types"
import { formatIDR } from "@/lib/format"
import type { Bill } from "@/services/bills"

// YYYY-MM → "July 2026".
function formatMonth(iso?: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}-01T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

// YYYY-MM-DD → "10 July 2026".
function formatDueDate(iso?: string): string {
  if (!iso) return "—"
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// RFC3339 → "10 July 2026".
function formatDate(iso: string): string {
  if (!iso) return "—"
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// The outstanding bill to surface: the first unpaid/overdue/gateway_pending one.
function outstandingBill(bills: Bill[]): Bill | undefined {
  return bills.find(
    (bill) =>
      bill.status === "unpaid" ||
      bill.status === "overdue" ||
      bill.status === "gateway_pending"
  )
}

function MyRoomCard() {
  const { data, isPending, isError, error } = useMyRoom()
  const notFound = error instanceof ApiClientError && error.status === 404

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {notFound ? "No room assigned yet" : "Unable to load your room"}
          </CardTitle>
          <CardDescription>
            {notFound
              ? "You do not have an active room assignment right now."
              : error instanceof ApiClientError
                ? error.message
                : "Please try again in a moment."}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Room {data.room_number}</CardTitle>
        <CardDescription>Your current room assignment</CardDescription>
      </CardHeader>
      <CardContent className="text-base">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Monthly rent</span>
          <span className="font-semibold">{formatIDR(data.monthly_rent)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CurrentBillCard() {
  const query = useTenantBills({ page: 1, limit: 5 })
  const bill = query.data ? outstandingBill(query.data.bills) : undefined

  if (query.isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-11 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (query.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current bill</CardTitle>
          <CardDescription>Unable to load your bills right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!bill) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current bill</CardTitle>
          <CardDescription>You&apos;re all caught up.</CardDescription>
        </CardHeader>
        <CardContent className="text-base text-muted-foreground">
          You have no outstanding bills right now.
        </CardContent>
      </Card>
    )
  }

  const isOverdue = bill.status === "overdue"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{formatMonth(bill.billing_month)} rent</CardTitle>
          <BillStatusBadge status={bill.status} />
        </div>
        <CardDescription>Due {formatDueDate(bill.due_date)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isOverdue ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-base text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300">
            <AlertTriangleIcon className="size-5 shrink-0" />
            This bill is overdue. Please pay as soon as possible.
          </div>
        ) : null}
        <p className="text-3xl font-bold tabular-nums">
          {formatIDR(bill.amount)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <PayNowButton billId={bill.id} status={bill.status} />
          <Button asChild variant="outline" size="lg">
            <Link href={`/tenant/bills/${bill.id}`}>View bill</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentPaymentsCard() {
  const query = useTenantPayments({ page: 1, limit: 3 })
  const payments = query.data?.payments ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Recent payments</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/tenant/payments">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-base text-muted-foreground">
              Unable to load your payments right now.
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Try again
            </Button>
          </div>
        ) : payments.length === 0 ? (
          <p className="text-base text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-base last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium tabular-nums">
                    {formatIDR(payment.amount)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(payment.payment_date)}
                  </span>
                </div>
                <PaymentSourceBadge source={payment.payment_source} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function TenantDashboard() {
  // Surface a dead session on any of the dashboard's queries.
  const room = useMyRoom()
  const bills = useTenantBills({ page: 1, limit: 5 })
  const payments = useTenantPayments({ page: 1, limit: 3 })
  useTenantAuthGuard(room.error, bills.error, payments.error)

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-6 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <MyRoomCard />
          <CurrentBillCard />
        </div>
        <RecentPaymentsCard />
      </div>
    </div>
  )
}
