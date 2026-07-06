"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { BillStatusBadge } from "@/components/bills/bill-status-badge"
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
import { useBill } from "@/hooks/use-bills"
import { errorMessage } from "@/lib/api/errors"
import { ApiClientError } from "@/lib/api/types"
import { formatIDR } from "@/lib/format"
import type { BillStatus } from "@/services/bills"

// Static UI copy describing what each status means operationally, so status is
// not conveyed by the badge colour alone.
const STATUS_HELP: Record<BillStatus, string> = {
  unpaid: "Awaiting payment. Due on the date shown below.",
  gateway_pending: "A payment link is open; awaiting gateway confirmation.",
  paid: "Fully paid. No further action needed.",
  overdue: "Past its due date and still unpaid.",
  cancelled: "This bill was cancelled and is no longer due.",
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-base text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium">{value}</dd>
    </div>
  )
}

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

// Full timestamp for the record metadata card.
function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("id-ID")
}

function roomLabel(roomNumber?: string, roomName?: string): string {
  const parts = [roomNumber, roomName].filter(Boolean)
  return parts.length ? parts.join(" · ") : "—"
}

export function BillDetail({ id }: { id: string }) {
  const bill = useBill(id)

  if (bill.isPending) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
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
            <Link href="/owner/bills">Back to bills</Link>
          </Button>
        </div>
      </div>
    )
  }

  const data = bill.data
  const monthLabel = formatMonth(data.billing_month)

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/owner/bills">Bills</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{monthLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {data.tenant_name || "Rent bill"}
          </h1>
          <p className="text-muted-foreground text-base">{monthLabel}</p>
        </div>
        <Button asChild variant="ghost" size="lg">
          <Link href="/owner/bills">
            <ArrowLeftIcon />
            Back to bills
          </Link>
        </Button>
      </div>

      {/* Highlight band — status and amount. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <BillStatusBadge status={data.status} />
            </div>
            <p className="text-base text-muted-foreground">
              {STATUS_HELP[data.status]}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-bold tabular-nums">
              {formatIDR(data.amount)}
            </p>
            <p className="text-base text-muted-foreground">
              Due {formatDueDate(data.due_date)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details + record metadata. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bill information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow label="Tenant" value={data.tenant_name || "—"} />
              <InfoRow
                label="Room"
                value={roomLabel(data.room_number, data.room_name)}
              />
              <InfoRow label="Billing month" value={monthLabel} />
              <InfoRow label="Amount" value={formatIDR(data.amount)} />
              <InfoRow label="Due date" value={formatDueDate(data.due_date)} />
              <InfoRow
                label="Status"
                value={<BillStatusBadge status={data.status} />}
              />
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow
                label="Created"
                value={formatTimestamp(data.created_at)}
              />
              <InfoRow
                label="Updated"
                value={formatTimestamp(data.updated_at)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
