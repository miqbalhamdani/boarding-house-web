"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
import { PayNowButton } from "@/components/tenant/pay-now-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTenantBill } from "@/hooks/use-tenant"
import { useTenantAuthGuard } from "@/hooks/use-tenant-auth-guard"
import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import { formatIDR } from "@/lib/format"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium">{value}</dd>
    </div>
  )
}

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

export function TenantBillDetail({ id }: { id: string }) {
  const bill = useTenantBill(id)
  useTenantAuthGuard(bill.error)

  if (bill.isPending) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-11 w-40" />
        </div>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (bill.isError || !bill.data) {
    const notFound =
      bill.error instanceof ApiClientError && bill.error.status === 404
    return (
      <div className="px-4 py-6 lg:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-lg font-medium">
            {notFound ? "Bill not found" : "Could not load bill"}
          </p>
          {!notFound && (
            <p className="text-base text-muted-foreground">
              {errorMessage(bill.error)}
            </p>
          )}
          <Button asChild variant="outline">
            <Link href="/tenant/bills">Back to bills</Link>
          </Button>
        </div>
      </div>
    )
  }

  const data = bill.data
  const isOverdue = data.status === "overdue"

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tenant/bills">My bills</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{formatMonth(data.billing_month)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {formatMonth(data.billing_month)} rent
          </h1>
          <p className="text-muted-foreground text-base">
            Due {formatDueDate(data.due_date)}
          </p>
        </div>
        <Button asChild variant="ghost" size="lg">
          <Link href="/tenant/bills">
            <ArrowLeftIcon />
            Back to bills
          </Link>
        </Button>
      </div>

      {isOverdue ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300">
          This bill is overdue. Please pay as soon as possible.
        </div>
      ) : null}

      {/* Highlight band — amount, status and the Pay Now action. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Amount due
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-3xl font-bold tabular-nums">
              {formatIDR(data.amount)}
            </p>
            <BillStatusBadge status={data.status} />
          </div>
          <PayNowButton billId={data.id} status={data.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bill information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <InfoRow
              label="Billing month"
              value={formatMonth(data.billing_month)}
            />
            <InfoRow label="Amount" value={formatIDR(data.amount)} />
            <InfoRow label="Due date" value={formatDueDate(data.due_date)} />
            <InfoRow
              label="Status"
              value={<BillStatusBadge status={data.status} />}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
